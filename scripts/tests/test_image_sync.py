"""Offline regression tests; never contact Google Drive or use credentials."""
import hashlib
import json
from pathlib import Path
import sys
import tempfile
import threading
import unittest
from unittest.mock import patch

import httplib2
from googleapiclient.errors import HttpError

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import fetch_gdrive as drive
import sync_images as images


def http_error(status, reason="forbidden", headers=None):
    response = httplib2.Response({"status": str(status), **(headers or {})})
    return HttpError(response, json.dumps({"error": {"errors": [{"reason": reason}]}}).encode())


def image(file_id, name, data, version="1"):
    return {"id": file_id, "name": name, "mimeType": "image/png",
            "size": str(len(data)), "md5Checksum": hashlib.md5(data).hexdigest(),
            "modifiedTime": "2026-10-12T00:00:00Z", "version": version}


def folder(file_id, name):
    return {"id": file_id, "name": name, "mimeType": drive.FOLDER_MIME}


class Request:
    def __init__(self, operation):
        self.operation = operation

    def execute(self):
        return self.operation()


class FakeDrive:
    def __init__(self, folders, payloads=None):
        self.folders = folders
        self.payloads = payloads or {}
        self.listed = []
        self.fail_page = None
        self.incomplete = False
        self.closed = False

    def files(self):
        return self

    def get(self, fileId, fields):
        def operation():
            if fileId not in self.folders:
                raise http_error(404)
            return {"id": fileId, "mimeType": drive.FOLDER_MIME, "trashed": False}
        return Request(operation)

    def list(self, q, fields, pageSize, pageToken):
        folder_id = q.split("'")[1]
        page = int(pageToken or "0")

        def operation():
            self.listed.append((folder_id, page))
            if self.fail_page == (folder_id, page):
                raise http_error(403)
            pages = self.folders[folder_id]
            result = {"files": pages[page], "incompleteSearch": self.incomplete}
            if page + 1 < len(pages):
                result["nextPageToken"] = str(page + 1)
            return result
        return Request(operation)

    def get_media(self, fileId):
        def operation():
            data = self.payloads[fileId]
            if isinstance(data, Exception):
                raise data
            return data
        return Request(operation)

    def close(self):
        self.closed = True


def snapshot(root):
    return {path.relative_to(root).as_posix(): path.read_bytes()
            for path in root.rglob("*") if path.is_file()}


class MirrorTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        self.root = Path(self.temporary.name) / "images"
        self.downloads = []
        self.clients = []
        self.service = FakeDrive({"root": [[]]})

    def fetch(self, request, destination):
        self.downloads.append(str(destination))
        return request.execute()

    def factory(self):
        client = FakeDrive(self.service.folders, self.service.payloads)
        self.clients.append(client)
        return client

    def sync(self, workers=4):
        with patch.object(drive, "execute_with_retry", side_effect=self.fetch):
            return drive.sync_images_mirror(self.service, self.factory, "root", self.root, workers)

    def test_pagination_nested_files_and_cache_reuse(self):
        self.service.folders = {
            "root": [[image("a", "one.png", b"one")], [folder("nested", "Icons")]],
            "nested": [[image("b", "two.png", b"two")]],
        }
        self.service.payloads = {"a": b"one", "b": b"two"}
        self.sync()
        self.assertEqual((self.root / "Icons/two.png").read_bytes(), b"two")
        self.assertIn(("root", 1), self.service.listed)
        self.assertTrue(all(client.closed for client in self.clients))
        self.downloads.clear()
        self.sync()
        self.assertEqual(self.downloads, [])

    def test_changed_same_size_new_renamed_and_deleted_files(self):
        self.service.folders = {"root": [[image("a", "old.png", b"old"),
                                          folder("nested", "Removed")]],
                                "nested": [[image("b", "gone.png", b"bye")]]}
        self.service.payloads = {"a": b"old", "b": b"bye"}
        self.sync()
        self.service.folders = {"root": [[image("a", "renamed.png", b"new", "2"),
                                          image("c", "added.png", b"add")]]}
        self.service.payloads = {"a": b"new", "c": b"add"}
        self.sync()
        self.assertFalse((self.root / "old.png").exists())
        self.assertFalse((self.root / "Removed").exists())
        self.assertEqual((self.root / "renamed.png").read_bytes(), b"new")
        self.assertEqual((self.root / "added.png").read_bytes(), b"add")
        self.service.folders["root"] = [[image("a", "renamed.png", b"NEW", "3")]]
        self.service.payloads["a"] = b"NEW"
        self.sync()
        self.assertEqual((self.root / "renamed.png").read_bytes(), b"NEW")

    def test_corrupt_cached_file_is_downloaded_again(self):
        self.service.folders["root"] = [[image("a", "one.png", b"one")]]
        self.service.payloads = {"a": b"one"}
        self.sync()
        (self.root / "one.png").write_bytes(b"bad")
        self.downloads.clear()
        self.sync()
        self.assertEqual(self.downloads, ["one.png"])
        self.assertEqual((self.root / "one.png").read_bytes(), b"one")

    def test_complete_empty_folder_prunes_old_images(self):
        self.root.mkdir()
        (self.root / "old.png").write_bytes(b"old")
        self.sync()
        self.assertEqual(set(snapshot(self.root)), {drive.MANIFEST_NAME})

    def test_listing_failures_never_prune_or_download(self):
        self.root.mkdir()
        (self.root / "old.png").write_bytes(b"old")
        before = snapshot(self.root)
        self.service.folders["root"] = [[image("a", "new.png", b"new")], []]
        self.service.fail_page = ("root", 1)
        with self.assertRaises(HttpError):
            self.sync()
        self.assertEqual(snapshot(self.root), before)
        self.assertEqual(self.downloads, [])
        self.service.fail_page = None
        self.service.incomplete = True
        with self.assertRaises(RuntimeError):
            self.sync()
        self.assertEqual(snapshot(self.root), before)

    def test_lost_folder_access_does_not_look_like_empty_folder(self):
        self.root.mkdir()
        (self.root / "old.png").write_bytes(b"old")
        self.service.folders = {}
        with self.assertRaises(HttpError):
            self.sync()
        self.assertTrue((self.root / "old.png").exists())

    def test_download_failure_preserves_all_cached_files_and_manifest(self):
        self.service.folders["root"] = [[image("a", "old.png", b"old")]]
        self.service.payloads = {"a": b"old"}
        self.sync()
        before = snapshot(self.root)
        self.service.folders["root"] = [[image("b", "new.png", b"new"),
                                         image("c", "fail.png", b"bad")]]
        self.service.payloads = {"b": b"new", "c": http_error(403)}
        with self.assertRaises(HttpError):
            self.sync()
        self.assertEqual(snapshot(self.root), before)
        self.assertTrue(all(client.closed for client in self.clients))

    def test_checksum_mismatch_preserves_cache(self):
        self.root.mkdir()
        (self.root / "old.png").write_bytes(b"old")
        self.service.folders["root"] = [[image("a", "one.png", b"one")]]
        self.service.payloads = {"a": b"bad"}
        before = snapshot(self.root)
        with self.assertRaisesRegex(RuntimeError, "checksum mismatch"):
            self.sync()
        self.assertEqual(snapshot(self.root), before)

    def test_failed_mirror_publish_restores_old_files_and_manifest(self):
        self.service.folders["root"] = [[image("a", "old.png", b"old")]]
        self.service.payloads = {"a": b"old"}
        self.sync()
        before = snapshot(self.root)
        self.service.folders["root"] = [[image("b", "new.png", b"new")]]
        self.service.payloads = {"b": b"new"}
        replace = drive.os.replace

        def fail_publish(source, destination):
            if Path(source).name == "mirror":
                raise OSError("disk error")
            return replace(source, destination)

        with patch.object(drive.os, "replace", side_effect=fail_publish):
            with self.assertRaises(OSError):
                self.sync()
        self.assertEqual(snapshot(self.root), before)

    def test_file_and_folder_shape_changes_are_mirrored(self):
        self.service.folders["root"] = [[image("a", "changing", b"old")]]
        self.service.payloads = {"a": b"old"}
        self.sync()
        self.service.folders = {"root": [[folder("nested", "changing")]],
                                "nested": [[image("b", "inside.png", b"new")]]}
        self.service.payloads = {"b": b"new"}
        self.sync()
        self.assertEqual((self.root / "changing/inside.png").read_bytes(), b"new")
        self.service.folders = {"root": [[image("c", "changing", b"file")]]}
        self.service.payloads = {"c": b"file"}
        self.sync()
        self.assertEqual((self.root / "changing").read_bytes(), b"file")

    def test_unsafe_names_collisions_and_symlinks_are_rejected(self):
        for name in ("..", ".", drive.MANIFEST_NAME):
            self.service.folders["root"] = [[image("a", name, b"a")]]
            with self.assertRaises(ValueError):
                self.sync()
        self.service.folders["root"] = [[image("a", "a/b.png", b"a"),
                                         image("b", "a_b.png", b"b")]]
        with self.assertRaisesRegex(ValueError, "Duplicate"):
            self.sync()
        self.service.folders["root"] = [[]]
        self.root.mkdir(exist_ok=True)
        outside = self.root.parent / "outside"
        outside.write_bytes(b"outside")
        (self.root / "linked.png").symlink_to(outside)
        with self.assertRaises(ValueError):
            self.sync()
        self.assertEqual(outside.read_bytes(), b"outside")

    def test_four_workers_have_separate_clients_and_global_limit(self):
        self.service.folders["root"] = [[image(str(i), f"{i}.png", b"x") for i in range(8)]]
        self.service.payloads = {str(i): b"x" for i in range(8)}
        barrier = threading.Barrier(4, timeout=5)
        lock = threading.Lock()
        threads = set()
        active = 0
        maximum = 0

        def fetch(request, destination):
            nonlocal active, maximum
            with lock:
                threads.add(threading.get_ident())
                active += 1
                maximum = max(maximum, active)
            barrier.wait()
            with lock:
                active -= 1
            return request.execute()

        self.fetch = fetch
        self.sync()
        self.assertEqual(len(threads), 4)
        self.assertEqual(len(self.clients), 4)
        self.assertEqual(maximum, 4)

    def test_modified_metadata_without_md5_invalidates_cached_file(self):
        entry = image("a", "one.png", b"one")
        del entry["md5Checksum"]
        self.service.folders["root"] = [[entry]]
        self.service.payloads = {"a": b"one"}
        self.sync()
        entry["modifiedTime"] = "2026-10-13T00:00:00Z"
        self.service.payloads["a"] = b"two"
        self.sync()
        self.assertEqual((self.root / "one.png").read_bytes(), b"two")


class RetryTests(unittest.TestCase):
    @patch.object(drive.time, "sleep")
    @patch.object(drive.random, "random", return_value=0.5)
    def test_rate_limit_server_errors_and_retry_after(self, jitter, sleep):
        for error in (http_error(429), http_error(503),
                      http_error(403, "userRateLimitExceeded")):
            operation = unittest.mock.Mock(side_effect=[error, "ok"])
            self.assertEqual(drive.with_retry(operation, "test"), "ok")
            sleep.assert_called_with(1.5)
        operation = unittest.mock.Mock(side_effect=[http_error(429, headers={"retry-after": "12"}), "ok"])
        self.assertEqual(drive.with_retry(operation, "test"), "ok")
        sleep.assert_called_with(12.0)

    @patch.object(drive.time, "sleep")
    def test_permission_errors_fail_immediately_and_retries_are_bounded(self, sleep):
        operation = unittest.mock.Mock(side_effect=http_error(403))
        with self.assertRaises(HttpError):
            drive.with_retry(operation, "test")
        self.assertEqual(operation.call_count, 1)
        sleep.assert_not_called()
        operation = unittest.mock.Mock(side_effect=http_error(429))
        with self.assertRaises(HttpError):
            drive.with_retry(operation, "test")
        self.assertEqual(operation.call_count, 6)
        self.assertEqual(sleep.call_count, 5)


class GeneratedImageTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        self.root = Path(self.temporary.name)
        self.source = self.root / "source"
        self.output = self.root / "output"
        for path in (self.source / "ALL ITEMS", self.source / "Icons", self.source / "Higher Quality"):
            path.mkdir(parents=True)

    def test_removed_outputs_same_size_updates_and_hq_fallback(self):
        standard = self.source / "ALL ITEMS/robot.png"
        high_quality = self.source / "Higher Quality/robot.png"
        icon = self.source / "Icons/role.png"
        standard.write_bytes(b"standard")
        high_quality.write_bytes(b"high quality")
        icon.write_bytes(b"icon")
        images.rebuild_image_directories(self.source, self.output)
        self.assertEqual((self.output / "items/robot.png").read_bytes(), b"high quality")
        high_quality.unlink()
        icon.unlink()
        images.rebuild_image_directories(self.source, self.output)
        self.assertEqual((self.output / "items/robot.png").read_bytes(), b"standard")
        self.assertFalse((self.output / "icons/role.png").exists())
        standard.write_bytes(b"STANDARD")
        images.rebuild_image_directories(self.source, self.output)
        self.assertEqual((self.output / "items/robot.png").read_bytes(), b"STANDARD")
        standard.unlink()
        images.rebuild_image_directories(self.source, self.output)
        self.assertFalse((self.output / "items/robot.png").exists())

    def test_root_and_nested_uploads_are_indexed_as_artwork(self):
        (self.source / "Harpy.png").write_bytes(b"root artwork")
        nested = self.source / "PNGs/Robots"
        nested.mkdir(parents=True)
        (nested / "Siren.webp").write_bytes(b"nested artwork")
        (self.source / "Icons/role.png").write_bytes(b"role icon")
        images.rebuild_image_directories(self.source, self.output)
        self.assertEqual((self.output / "items/Harpy.png").read_bytes(), b"root artwork")
        self.assertEqual((self.output / "items/Siren.webp").read_bytes(), b"nested artwork")
        self.assertTrue((self.output / "icons/role.png").exists())
        self.assertFalse((self.output / "items/role.png").exists())

    def test_failed_generation_keeps_previous_outputs(self):
        (self.source / "ALL ITEMS/robot.png").write_bytes(b"old")
        images.rebuild_image_directories(self.source, self.output)
        before = snapshot(self.output)
        with patch.object(images, "copy_image", side_effect=OSError("disk full")):
            with self.assertRaises(OSError):
                images.rebuild_image_directories(self.source, self.output)
        self.assertEqual(snapshot(self.output), before)

    def test_absent_source_preserves_existing_images_and_manifest(self):
        with patch.object(images, "sample_images_dir", str(self.root / "missing")), \
                patch.object(images, "rebuild_image_directories") as rebuild:
            self.assertTrue(images.sync_images())
            rebuild.assert_not_called()

    def test_deleted_images_disappear_from_generated_manifest(self):
        source = self.source / "ALL ITEMS/robot.png"
        source.write_bytes(b"robot")
        manifest = self.root / "image_manifest.json"
        guide = self.root / "robot_guide.json"
        guide.write_text(json.dumps({"robots": [{"name": "Robot"}]}))
        with patch.object(images, "sample_images_dir", str(self.source)), \
                patch.object(images, "public_images_dir", str(self.output)), \
                patch.object(images, "manifest_path", str(manifest)), \
                patch.object(images, "workspace_dir", str(self.root)), \
                patch.object(images, "robot_guide_path", str(guide)), \
                patch.object(images, "weapons_dps_path", str(self.root / "missing.json")):
            images.sync_images()
            self.assertIn("robot", json.loads(manifest.read_text())["items"])
            source.unlink()
            images.sync_images()
            result = json.loads(manifest.read_text())
            self.assertNotIn("robot", result["items"])
            self.assertNotIn("robot", result["all_files"])

    def test_directory_replacement_failure_rolls_back_both_outputs(self):
        (self.source / "ALL ITEMS/robot.png").write_bytes(b"old")
        (self.source / "Icons/role.png").write_bytes(b"old icon")
        images.rebuild_image_directories(self.source, self.output)
        before = snapshot(self.output)
        replace = images.os.replace

        def fail_second_directory(source, destination):
            if Path(source).name == "icons":
                raise OSError("replace failed")
            return replace(source, destination)

        with patch.object(images.os, "replace", side_effect=fail_second_directory):
            with self.assertRaises(OSError):
                images.rebuild_image_directories(self.source, self.output)
        self.assertEqual(snapshot(self.output), before)


if __name__ == "__main__":
    unittest.main()
