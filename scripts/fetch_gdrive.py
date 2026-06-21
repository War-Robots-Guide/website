import os
import io
import sys
import json
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload

# Config
GDRIVE_FOLDER_ID = os.environ.get("GDRIVE_FOLDER_ID")
GDRIVE_CREDENTIALS_JSON = os.environ.get("GDRIVE_CREDENTIALS_JSON") # Service Account credentials string
script_dir = os.path.dirname(os.path.abspath(__file__))
workspace_dir = os.path.dirname(script_dir)
TARGET_DIR = os.path.join(workspace_dir, "sample data")

def download_folder_files():
    if not GDRIVE_FOLDER_ID:
        print("GDRIVE_FOLDER_ID environment variable not found. Skipping Google Drive download.")
        print("Using existing files in the 'sample data' directory.")
        return True
        
    if not GDRIVE_CREDENTIALS_JSON:
        print("GDRIVE_CREDENTIALS_JSON environment variable not found. Skipping Google Drive download.")
        print("Using existing files in the 'sample data' directory.")
        return True
        
    try:
        # Load credentials
        creds_info = json.loads(GDRIVE_CREDENTIALS_JSON)
        creds = service_account.Credentials.from_service_account_info(
            creds_info, 
            scopes=["https://www.googleapis.com/auth/drive.readonly"]
        )
        
        # Build service
        service = build("drive", "v3", credentials=creds)
        
        # Ensure target dir exists
        os.makedirs(TARGET_DIR, exist_ok=True)
        
        # List files in the folder
        query = f"'{GDRIVE_FOLDER_ID}' in parents and trashed = false"
        print(f"Listing files in folder ID: {GDRIVE_FOLDER_ID}...")
        
        results = service.files().list(
            q=query,
            fields="files(id, name, mimeType)"
        ).execute()
        
        files = results.get("files", [])
        if not files:
            print("No files found in the Google Drive folder.")
            return True
            
        print(f"Found {len(files)} files. Starting downloads...")
        
        for file in files:
            file_id = file["id"]
            raw_file_name = file["name"]
            mime_type = file["mimeType"]
            
            # Skip subfolders
            if mime_type == "application/vnd.google-apps.folder":
                print(f"Skipping subfolder: {raw_file_name}")
                continue
                
            # Sanitize filename to avoid folder structure errors due to slashes in GDrive names
            file_name = raw_file_name.replace("/", "_").replace("\\", "_")
            dest_path = os.path.join(TARGET_DIR, file_name)
            
            # Download file
            print(f"Downloading {file_name} ({file_id})...")
            
            # Google Office documents (docs, sheets) need to be exported
            # but we assume the user uploaded .xlsx and .docx files directly.
            # If they are Google Sheets or Google Docs, we export them as XLSX / DOCX
            request = None
            if mime_type == "application/vnd.google-apps.spreadsheet":
                print(f"Exporting Google Sheet {file_name} to Excel format...")
                request = service.files().export_media(
                    fileId=file_id,
                    mimeType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                )
                # update destination filename extension to .xlsx
                if not dest_path.endswith('.xlsx'):
                    dest_path += '.xlsx'
            elif mime_type == "application/vnd.google-apps.document":
                print(f"Exporting Google Doc {file_name} to Word format...")
                request = service.files().export_media(
                    fileId=file_id,
                    mimeType="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                )
                # update destination filename extension to .docx
                if not dest_path.endswith('.docx'):
                    dest_path += '.docx'
            else:
                # Direct download for binary files
                request = service.files().get_media(fileId=file_id)
                
            # Perform download
            fh = io.BytesIO()
            downloader = MediaIoBaseDownload(fh, request)
            done = False
            while not done:
                status, done = downloader.next_chunk()
                if status:
                    print(f"  Progress: {int(status.progress() * 100)}%")
                    
            # Write to disk
            with open(dest_path, "wb") as f:
                f.write(fh.getvalue())
            print(f"Saved to: {dest_path}")
            
        print("Sync with Google Drive completed successfully.")
        return True
        
    except Exception as e:
        print(f"Error fetching Google Drive content: {e}", file=sys.stderr)
        return False

if __name__ == "__main__":
    success = download_folder_files()
    if not success:
        sys.exit(1)
