"""Execute deployment restore commands against local Git fixtures, without networking."""
import json
import os
from pathlib import Path
import re
import subprocess
import sys
from tempfile import TemporaryDirectory
import unittest

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'scripts'))
from pilot_tiers import SOURCE_URL


class PilotDeployTests(unittest.TestCase):
    def test_restore_prefers_valid_published_snapshot_and_rejects_bad_or_absent_one(self):
        workflow = (ROOT / '.github/workflows/deploy.yml').read_text()
        block = re.search(r'      - name: Restore equipment history[^\n]*\n        run: \|\n(.*?)(?=\n      - name:)', workflow, re.S).group(1)
        commands = '\n'.join(line[10:] for line in block.splitlines())
        seed = {'schemaVersion': 1, 'sourceUrl': SOURCE_URL, 'fetchedAt': '2026-10-24T00:00:00Z', 'tiers': [{'label': 'Hot', 'items': [{'name': 'Seed'}]}]}
        published = {**seed, 'fetchedAt': '2026-10-25T00:00:00Z', 'tiers': [{'label': 'Hot', 'items': [{'name': 'Published'}]}]}
        for variant in ['valid', 'invalid', 'absent', 'initial']:
            with self.subTest(variant=variant), TemporaryDirectory() as folder:
                root = Path(folder)
                def run(*args):
                    return subprocess.run(args, cwd=root, check=True, capture_output=True, text=True)
                run('git', 'init', '-b', 'work')
                run('git', 'config', 'user.email', 'fixture@example.invalid')
                run('git', 'config', 'user.name', 'Fixture')
                run('git', 'config', 'commit.gpgsign', 'false')
                run('git', 'config', 'core.hooksPath', str(root / 'no-hooks'))
                run('git', 'remote', 'add', 'origin', str(root))
                data = root / 'src/data'; data.mkdir(parents=True)
                output = data / 'pilot_tiers.json'; output.write_text(json.dumps(seed))
                scripts = root / 'scripts'; scripts.mkdir()
                (scripts / 'pilot_tiers.py').write_text((ROOT / 'scripts/pilot_tiers.py').read_text())
                run('git', 'add', '.')
                run('git', 'commit', '-m', 'seed')
                if variant != 'initial':
                    run('git', 'checkout', '-b', 'gh-pages')
                    if variant == 'valid': output.write_text(json.dumps(published))
                    elif variant == 'invalid': output.write_text('{broken')
                    else: output.unlink()
                    run('git', 'add', '.')
                    run('git', 'commit', '--allow-empty', '-m', 'published')
                    run('git', 'checkout', 'work')
                env = {**os.environ, 'PATH': str(Path(sys.executable).parent) + os.pathsep + os.environ['PATH'], 'TMPDIR': str(root)}
                result = subprocess.run(['bash', '-e', '-o', 'pipefail', '-c', commands], cwd=root, env=env, capture_output=True, text=True)
                self.assertEqual(result.returncode, 0, result.stderr)
                self.assertEqual(json.loads(output.read_text()), published if variant == 'valid' else seed)
