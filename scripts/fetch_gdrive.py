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
GDRIVE_CREDENTIALS_JSON = os.environ.get("GDRIVE_CREDENTIALS_JSON") # Service Account credentials string
script_dir = os.path.dirname(os.path.abspath(__file__))
workspace_dir = os.path.dirname(script_dir)
TARGET_DIR = os.path.join(workspace_dir, "sample data")

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

def download_folder_files():
    if not GDRIVE_FOLDER_ID:
        print("Error: GDRIVE_FOLDER_ID environment variable not found.", file=sys.stderr)
        return False
        
    # Validate Google Drive Folder ID format to prevent injection/malformed queries
    if not re.match(r'^[a-zA-Z0-9_-]+$', GDRIVE_FOLDER_ID):
        print("Error: GDRIVE_FOLDER_ID contains invalid characters. Expected alphanumeric, dashes, or underscores.", file=sys.stderr)
        return False

    if not GDRIVE_CREDENTIALS_JSON:
        print("Error: GDRIVE_CREDENTIALS_JSON environment variable not found.", file=sys.stderr)
        return False
        
    try:
        # Load credentials safely
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
        
        # Build service
        service = build("drive", "v3", credentials=creds)
        
        # Ensure target dir exists
        os.makedirs(TARGET_DIR, exist_ok=True)
        
        # List files in the folder (handles queries safely)
        query = f"'{GDRIVE_FOLDER_ID}' in parents and trashed = false"
        print(f"Listing files in folder ID: {GDRIVE_FOLDER_ID}...")
        
        # List up to 1000 files in a single page
        results = service.files().list(
            q=query,
            fields="files(id, name, mimeType)",
            pageSize=1000
        ).execute()
        
        files = results.get("files", [])
        if not files:
            print("No files found in the Google Drive folder.")
            return True
            
        print(f"Found {len(files)} files. Starting downloads...")
        
        # Ensure target dir absolute path is fetched for path traversal guard
        target_dir_abs = os.path.abspath(TARGET_DIR)

        for file in files:
            file_id = file["id"]
            raw_file_name = file["name"]
            mime_type = file["mimeType"]
            
            # Skip subfolders
            if mime_type == "application/vnd.google-apps.folder":
                print(f"Skipping subfolder: {raw_file_name}")
                continue
                
            # Sanitize filename by stripping path components and substituting unsafe characters
            safe_name = os.path.basename(raw_file_name.replace("/", "_").replace("\\", "_"))
            dest_path = os.path.join(TARGET_DIR, safe_name)
            
            # Absolute path resolution check to prevent directory traversal
            dest_path = os.path.abspath(dest_path)
            if not dest_path.startswith(target_dir_abs):
                print(f"Error: Path traversal attempt detected in filename: {raw_file_name}", file=sys.stderr)
                return False
            
            # Google Office documents (docs, sheets) need to be exported
            # but we assume the user uploaded .xlsx and .docx files directly.
            # If they are Google Sheets or Google Docs, we export them as XLSX / DOCX
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
                # Direct download for binary files
                request = service.files().get_media(fileId=file_id)
                
            # Perform download with retry logic
            print(f"Downloading {os.path.basename(dest_path)} ({file_id})...")
            file_data = execute_with_retry(request, dest_path)
            
            # Write to disk atomically using temporary file + rename to avoid partial writes
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

