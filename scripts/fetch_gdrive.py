import os
import io
import sys
import json
import re
import time
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload
from googleapiclient.errors import HttpError

# Config
GDRIVE_FOLDER_ID = os.environ.get("GDRIVE_FOLDER_ID")
GDRIVE_IMAGES_FOLDER_ID = os.environ.get("GDRIVE_IMAGES_FOLDER_ID")
GDRIVE_CREDENTIALS_JSON = os.environ.get("GDRIVE_CREDENTIALS_JSON") # Service Account credentials string
script_dir = os.path.dirname(os.path.abspath(__file__))
workspace_dir = os.path.dirname(script_dir)
TARGET_DATA_DIR = os.path.join(workspace_dir, "sample data")
TARGET_IMAGES_DIR = os.path.join(workspace_dir, "sample images")

def execute_with_retry(request, dest_path):
    """Executes a Google Drive file download with exponential backoff retry logic."""
    max_retries = 3
    for attempt in range(max_retries):
        try:
            fh = io.BytesIO()
            downloader = MediaIoBaseDownload(fh, request)
            done = False
            while not done:
                status, done = downloader.next_chunk()
                if status:
                    print(f"  Progress: {int(status.progress() * 100)}%")
            return fh.getvalue()
        except Exception as e:
            if attempt == max_retries - 1:
                raise e
            sleep_time = 2 ** attempt
            print(f"  Download attempt {attempt + 1} failed: {e}. Retrying in {sleep_time}s...")
            time.sleep(sleep_time)

def sync_folder_recursive(service, folder_id, target_dir, root_target_abs, recurse_subfolders=True):
    """Recursively downloads or syncs all files and subdirectories from a Google Drive folder."""
    os.makedirs(target_dir, exist_ok=True)
    query = f"'{folder_id}' in parents and trashed = false"
    print(f"Listing files in folder ID: {folder_id} -> {target_dir}...")

    results = service.files().list(
        q=query,
        fields="files(id, name, mimeType, size)",
        pageSize=1000
    ).execute()

    files = results.get("files", [])
    if not files:
        print(f"No files found in folder {folder_id}.")
        return True

    for file in files:
        file_id = file["id"]
        raw_file_name = file["name"]
        mime_type = file["mimeType"]
        file_size = int(file.get("size", 0)) if file.get("size") else None

        safe_name = os.path.basename(raw_file_name.replace("/", "_").replace("\\", "_"))
        dest_path = os.path.join(target_dir, safe_name)
        dest_path = os.path.abspath(dest_path)

        # Path traversal guard
        if os.path.commonpath([root_target_abs, dest_path]) != root_target_abs:
            print(f"Error: Path traversal attempt detected in filename: {raw_file_name}", file=sys.stderr)
            return False

        if mime_type == "application/vnd.google-apps.folder":
            if recurse_subfolders:
                print(f"Entering subfolder: {safe_name}...")
                success = sync_folder_recursive(service, file_id, dest_path, root_target_abs, recurse_subfolders=True)
                if not success:
                    return False
            else:
                print(f"Skipping subfolder: {safe_name}")
            continue

        request = None
        if mime_type == "application/vnd.google-apps.spreadsheet":
            print(f"Exporting Google Sheet {safe_name} to Excel format...")
            request = service.files().export_media(
                fileId=file_id,
                mimeType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            )
            if not dest_path.endswith('.xlsx'):
                dest_path += '.xlsx'
        elif mime_type == "application/vnd.google-apps.document":
            print(f"Exporting Google Doc {safe_name} to Word format...")
            request = service.files().export_media(
                fileId=file_id,
                mimeType="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            )
            if not dest_path.endswith('.docx'):
                dest_path += '.docx'
        else:
            # Check incremental download: if file already exists with same size, skip
            if file_size is not None and os.path.exists(dest_path) and os.path.getsize(dest_path) == file_size:
                print(f"  Already up-to-date: {os.path.basename(dest_path)}")
                continue
            request = service.files().get_media(fileId=file_id)

        print(f"Downloading {os.path.basename(dest_path)} ({file_id})...")
        file_data = execute_with_retry(request, dest_path)

        temp_path = dest_path + ".tmp"
        try:
            with open(temp_path, "wb") as f:
                f.write(file_data)
            os.replace(temp_path, dest_path)
        except Exception as e:
            if os.path.exists(temp_path):
                os.remove(temp_path)
            raise e

        print(f"Saved to: {dest_path}")

    return True

def download_folder_files():
    if not GDRIVE_FOLDER_ID and not GDRIVE_IMAGES_FOLDER_ID:
        print("Error: Neither GDRIVE_FOLDER_ID nor GDRIVE_IMAGES_FOLDER_ID environment variable found.", file=sys.stderr)
        return False
        
    for fid, name in [(GDRIVE_FOLDER_ID, "GDRIVE_FOLDER_ID"), (GDRIVE_IMAGES_FOLDER_ID, "GDRIVE_IMAGES_FOLDER_ID")]:
        if fid and not re.match(r'^[a-zA-Z0-9_-]+$', fid):
            print(f"Error: {name} contains invalid characters. Expected alphanumeric, dashes, or underscores.", file=sys.stderr)
            return False

    if not GDRIVE_CREDENTIALS_JSON:
        print("Error: GDRIVE_CREDENTIALS_JSON environment variable not found.", file=sys.stderr)
        return False
        
    try:
        try:
            creds_info = json.loads(GDRIVE_CREDENTIALS_JSON)
        except json.JSONDecodeError:
            print("Error: GDRIVE_CREDENTIALS_JSON is not a valid JSON object.", file=sys.stderr)
            return False

        if not isinstance(creds_info, dict):
            print("Error: GDRIVE_CREDENTIALS_JSON does not contain a dictionary configuration.", file=sys.stderr)
            return False

        creds = service_account.Credentials.from_service_account_info(
            creds_info, 
            scopes=["https://www.googleapis.com/auth/drive.readonly"]
        )
        
        service = build("drive", "v3", credentials=creds)

        # 1. Sync data files if folder ID provided
        if GDRIVE_FOLDER_ID:
            print(f"--- Starting Google Drive Data Sync ({GDRIVE_FOLDER_ID}) ---")
            target_data_abs = os.path.abspath(TARGET_DATA_DIR)
            ok = sync_folder_recursive(service, GDRIVE_FOLDER_ID, TARGET_DATA_DIR, target_data_abs, recurse_subfolders=False)
            if not ok:
                return False

        # 2. Sync images recursively if images folder ID provided
        if GDRIVE_IMAGES_FOLDER_ID:
            print(f"--- Starting Google Drive Images Sync ({GDRIVE_IMAGES_FOLDER_ID}) ---")
            target_images_abs = os.path.abspath(TARGET_IMAGES_DIR)
            ok = sync_folder_recursive(service, GDRIVE_IMAGES_FOLDER_ID, TARGET_IMAGES_DIR, target_images_abs, recurse_subfolders=True)
            if not ok:
                return False

        print("Sync with Google Drive completed successfully.")
        return True
        
    except HttpError as e:
        print(f"Google Drive API HTTP error fetching content: {e}", file=sys.stderr)
        return False
    except Exception as e:
        print(f"Error fetching Google Drive content: {e}", file=sys.stderr)
        return False

if __name__ == "__main__":
    success = download_folder_files()
    if not success:
        sys.exit(1)

