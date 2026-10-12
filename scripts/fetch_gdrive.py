import hashlib
import io
import json
import os
from pathlib import Path
import random
import re
import shutil
import sys
import tempfile
import threading
import time
from concurrent.futures import ThreadPoolExecutor
from email.utils import parsedate_to_datetime

import httplib2
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from googleapiclient.http import MediaIoBaseDownload

GDRIVE_FOLDER_ID = os.environ.get("GDRIVE_FOLDER_ID")
GDRIVE_IMAGES_FOLDER_ID = os.environ.get("GDRIVE_IMAGES_FOLDER_ID")
GDRIVE_CREDENTIALS_JSON = os.environ.get("GDRIVE_CREDENTIALS_JSON")
workspace_dir = Path(__file__).resolve().parent.parent
TARGET_DATA_DIR = workspace_dir / "sample data"
TARGET_IMAGES_DIR = workspace_dir / "sample images"
MANIFEST_NAME = ".drive-image-manifest.json"
FOLDER_MIME = "application/vnd.google-apps.folder"
EXPORT_TYPES = {
    "application/vnd.google-apps.spreadsheet": (
        ".xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ),
    "application/vnd.google-apps.document": (
        ".docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ),
}


def retryable(error):
    if not isinstance(error, HttpError):
        return isinstance(error, (OSError, httplib2.HttpLib2Error))
    if error.resp.status in (429, 500, 502, 503, 504):
        return True
    if error.resp.status == 403:
        try:
            reasons = {entry.get("reason") for entry in json.loads(error.content)
                       .get("error", {}).get("errors", [])}
        except (ValueError, TypeError, AttributeError):
            return False
        return bool(reasons & {"rateLimitExceeded", "userRateLimitExceeded"})
    return False


def with_retry(operation, context, attempts=6):
    """Retry transient failures, leaving permission and missing-file errors fatal."""
    for attempt in range(attempts):
        try:
            return operation()
        except Exception as error:
            if attempt == attempts - 1 or not retryable(error):
                raise
            delay = min(2 ** attempt + random.random(), 64)
            if isinstance(error, HttpError):
                retry_after = error.resp.get("retry-after")
                if retry_after:
                    try:
                        server_delay = float(retry_after)
                    except ValueError:
                        try:
                            server_delay = parsedate_to_datetime(retry_after).timestamp() - time.time()
                        except (ValueError, TypeError, OverflowError):
                            server_delay = 0
                    delay = max(delay, server_delay)
            print(f"Retrying {context} in {delay:.1f}s (attempt {attempt + 1}): {error}")
            time.sleep(delay)


def execute_with_retry(request, dest_path):
    """Download with retries per chunk so successful chunks aren't fetched again."""
    output = io.BytesIO()
    downloader = MediaIoBaseDownload(output, request)
    done = False
    while not done:
        _, done = with_retry(downloader.next_chunk, str(dest_path))
    return output.getvalue()


def checked_path(root, relative):
    path = root / relative
    if not path.resolve().is_relative_to(root.resolve()):
        raise ValueError(f"Path escapes sync directory: {relative}")
    # Never follow links restored from a cache, including links within the root.
    if root.is_symlink() or any(parent.is_symlink() for parent in [path, *path.parents] if parent != root.parent):
        raise ValueError(f"Symlink in sync path: {relative}")
    return path


def inventory_folder(service, folder_id, recurse_subfolders=True):
    """Finish every listing before allowing any download or deletion."""
    files = {}
    directories = set()
    claimed_paths = set()
    visited = set()

    def visit(current_id, parent):
        if current_id in visited:
            raise ValueError("Repeated Drive folder ID in recursive listing")
        visited.add(current_id)
        folder = with_retry(
            service.files().get(fileId=current_id, fields="id,mimeType,trashed").execute,
            f"checking folder {current_id}",
        )
        if folder.get("trashed") or folder.get("mimeType") != FOLDER_MIME:
            raise RuntimeError(f"Drive folder is unavailable: {current_id}")
        token = None
        seen_tokens = set()
        while True:
            request = service.files().list(
                q=f"'{current_id}' in parents and trashed = false",
                fields="nextPageToken,incompleteSearch,files(id,name,mimeType,size,md5Checksum,modifiedTime,version)",
                pageSize=1000,
                pageToken=token,
            )
            result = with_retry(request.execute, f"listing folder {current_id}")
            if result.get("incompleteSearch"):
                raise RuntimeError("Drive returned an incomplete listing; refusing to mirror")
            for entry in result.get("files", []):
                mime = entry["mimeType"]
                if mime == FOLDER_MIME and not recurse_subfolders:
                    continue
                name = entry["name"].replace("/", "_").replace("\\", "_")
                if name in ("", ".", "..", MANIFEST_NAME):
                    raise ValueError(f"Unsafe or reserved Drive filename: {name!r}")
                if mime in EXPORT_TYPES:
                    extension, _ = EXPORT_TYPES[mime]
                    if not name.endswith(extension):
                        name += extension
                relative = (parent / name).as_posix()
                if relative in claimed_paths:
                    raise ValueError(f"Duplicate destination in Drive listing: {relative}")
                claimed_paths.add(relative)
                if mime == FOLDER_MIME:
                    directories.add(relative)
                    visit(entry["id"], Path(relative))
                else:
                    files[relative] = entry
            token = result.get("nextPageToken")
            if not token:
                break
            if token in seen_tokens:
                raise RuntimeError("Drive repeated a page token; refusing an incomplete mirror")
            seen_tokens.add(token)

    visit(folder_id, Path())
    return files, directories


def download_request(service, entry):
    export = EXPORT_TYPES.get(entry["mimeType"])
    if export:
        return service.files().export_media(fileId=entry["id"], mimeType=export[1])
    return service.files().get_media(fileId=entry["id"])


def checksum(path, algorithm="sha256"):
    digest = hashlib.new(algorithm)
    with open(path, "rb") as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def fingerprint(entry):
    return {key: entry.get(key) for key in
            ("id", "mimeType", "size", "md5Checksum", "modifiedTime", "version")}


def atomic_json(path, value):
    with tempfile.NamedTemporaryFile(mode="w", dir=path.parent, delete=False, encoding="utf8") as output:
        temporary = Path(output.name)
        try:
            json.dump(value, output, indent=2, sort_keys=True)
        except Exception:
            temporary.unlink(missing_ok=True)
            raise
    try:
        os.replace(temporary, path)
    finally:
        temporary.unlink(missing_ok=True)


def sync_images_mirror(service, service_factory, folder_id, target_dir, workers=4):
    """Stage a complete update, then reconcile a dedicated image cache directory."""
    if not 1 <= workers <= 8:
        raise ValueError("GDRIVE_DOWNLOAD_WORKERS must be between 1 and 8")
    root = Path(target_dir).absolute()
    checked_path(root, Path())
    files, directories = inventory_folder(service, folder_id)
    root.mkdir(parents=True, exist_ok=True)
    manifest_path = root / MANIFEST_NAME
    checked_path(root, Path(MANIFEST_NAME))
    try:
        previous = json.loads(manifest_path.read_text(encoding="utf8"))
        if previous.get("schema") != 1 or previous.get("folderId") != folder_id:
            previous = {}
    except (OSError, ValueError, AttributeError):
        previous = {}
    old_files = previous.get("files", {})
    if not isinstance(old_files, dict):
        old_files = {}

    # Validate the entire local tree before downloading or pruning.
    local_paths = list(root.rglob("*"))
    for path in local_paths:
        checked_path(root, path.relative_to(root))
    for relative in [*directories, *files]:
        checked_path(root, relative)

    new_manifest = {"schema": 1, "folderId": folder_id,
                    "directories": sorted(directories), "files": {}}
    pending = []
    for relative, entry in files.items():
        path = checked_path(root, relative)
        old = old_files.get(relative, {})
        if (isinstance(old, dict) and old.get("remote") == fingerprint(entry)
                and (entry.get("md5Checksum") or entry.get("modifiedTime") or entry.get("version"))
                and path.is_file() and old.get("sha256") == checksum(path)):
            new_manifest["files"][relative] = old
        else:
            pending.append(relative)

    clients = []
    client_lock = threading.Lock()
    local = threading.local()
    try:
        # Stage on the same filesystem so publishing can use directory renames.
        with tempfile.TemporaryDirectory(prefix=".drive-images-", dir=root.parent) as staging_dir:
            staging_parent = Path(staging_dir)
            staging = staging_parent / "mirror"
            staging.mkdir()
            for relative in directories:
                (staging / relative).mkdir(parents=True, exist_ok=True)
            for relative in new_manifest["files"]:
                destination = staging / relative
                destination.parent.mkdir(parents=True, exist_ok=True)
                try:
                    os.link(root / relative, destination)
                except OSError:
                    shutil.copy2(root / relative, destination)

            def download(relative):
                if not hasattr(local, "service"):
                    local.service = service_factory()
                    with client_lock:
                        clients.append(local.service)
                entry = files[relative]
                path = staging / relative
                path.parent.mkdir(parents=True, exist_ok=True)
                print(f"Downloading {relative}...")
                path.write_bytes(execute_with_retry(download_request(local.service, entry), relative))
                if entry["mimeType"] not in EXPORT_TYPES:
                    if entry.get("size") is not None and path.stat().st_size != int(entry["size"]):
                        raise RuntimeError(f"Downloaded size mismatch: {relative}")
                    if entry.get("md5Checksum") and checksum(path, "md5") != entry["md5Checksum"]:
                        raise RuntimeError(f"Downloaded checksum mismatch: {relative}")
                return relative, {"remote": fingerprint(entry), "sha256": checksum(path)}

            with ThreadPoolExecutor(max_workers=workers) as executor:
                for relative, metadata in executor.map(download, pending):
                    new_manifest["files"][relative] = metadata

            # Publish only a fully verified mirror, including its manifest.
            # Keeping the old directory until the swap succeeds also supports
            # file-to-folder and folder-to-file changes without early deletion.
            atomic_json(staging / MANIFEST_NAME, new_manifest)
            removed = sum(path.is_file() and path.relative_to(root).as_posix() not in files
                          and path.name != MANIFEST_NAME for path in local_paths)
            backup = staging_parent / "previous"
            os.replace(root, backup)
            try:
                os.replace(staging, root)
            except Exception:
                os.replace(backup, root)
                raise
            print(f"Images: downloaded {len(pending)}, reused {len(files) - len(pending)}, removed {removed}")
    finally:
        for client in clients:
            client.close()
    return True


def sync_folder_recursive(service, folder_id, target_dir, root_target_abs, recurse_subfolders=True):
    """Sync data exports without pruning local data files."""
    root = Path(root_target_abs)
    files, directories = inventory_folder(service, folder_id, recurse_subfolders)
    target = Path(target_dir)
    target.mkdir(parents=True, exist_ok=True)
    for relative in directories:
        checked_path(root, target.relative_to(root) / relative).mkdir(parents=True, exist_ok=True)
    for relative, entry in files.items():
        destination = checked_path(root, target.relative_to(root) / relative)
        data = execute_with_retry(download_request(service, entry), destination)
        with tempfile.NamedTemporaryFile(dir=destination.parent, delete=False) as output:
            temporary = Path(output.name)
            try:
                output.write(data)
            except Exception:
                temporary.unlink(missing_ok=True)
                raise
        try:
            os.replace(temporary, destination)
        finally:
            temporary.unlink(missing_ok=True)
    return True


def download_folder_files():
    if not GDRIVE_FOLDER_ID and not GDRIVE_IMAGES_FOLDER_ID:
        print("Error: No Google Drive folder IDs configured.", file=sys.stderr)
        return False
    for folder_id in (GDRIVE_FOLDER_ID, GDRIVE_IMAGES_FOLDER_ID):
        if folder_id and not re.fullmatch(r"[a-zA-Z0-9_-]+", folder_id):
            print("Error: Invalid Google Drive folder ID.", file=sys.stderr)
            return False
    service = None
    try:
        info = json.loads(GDRIVE_CREDENTIALS_JSON or "null")
        if not isinstance(info, dict):
            raise ValueError("GDRIVE_CREDENTIALS_JSON must contain a JSON object")
        workers = int(os.environ.get("GDRIVE_DOWNLOAD_WORKERS", "4"))
        if not 1 <= workers <= 8:
            raise ValueError("GDRIVE_DOWNLOAD_WORKERS must be between 1 and 8")

        def service_factory():
            # Credentials and HTTP transport belong to this client/thread only.
            credentials = service_account.Credentials.from_service_account_info(
                info, scopes=["https://www.googleapis.com/auth/drive.readonly"]
            )
            return build("drive", "v3", credentials=credentials, cache_discovery=False)

        service = service_factory()
        if GDRIVE_FOLDER_ID:
            sync_folder_recursive(service, GDRIVE_FOLDER_ID, TARGET_DATA_DIR,
                                  str(TARGET_DATA_DIR), recurse_subfolders=False)
        if GDRIVE_IMAGES_FOLDER_ID:
            sync_images_mirror(service, service_factory, GDRIVE_IMAGES_FOLDER_ID,
                               TARGET_IMAGES_DIR, workers)
        print("Sync with Google Drive completed successfully.")
        return True
    except Exception as error:
        print(f"Error fetching Google Drive content: {error}", file=sys.stderr)
        return False
    finally:
        if service is not None:
            service.close()


if __name__ == "__main__":
    if not download_folder_files():
        sys.exit(1)
