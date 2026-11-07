import process from 'node:process';
import { mkdtempSync, cpSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { it, expect } from 'vitest';

it('accepts a build with an empty explanation but rejects a non-string', () => {
  const root = mkdtempSync(join(tmpdir(), 'data-validation-'));
  try {
    cpSync('scripts/validate_data.js', join(root, 'scripts/validate_data.js'));
    cpSync('src/data', join(root, 'src/data'), { recursive: true });
    cpSync('src/utils/pilotTiers.js', join(root, 'src/utils/pilotTiers.js'));
    writeFileSync(join(root, 'package.json'), '{"type":"module"}');
    const path = join(root, 'src/data/robot_guide.json');
    const data = JSON.parse(readFileSync(path));
    data.builds[0].explanation = '';
    writeFileSync(path, JSON.stringify(data));
    const run = () => spawnSync(process.execPath, [join(root, 'scripts/validate_data.js')], { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
    expect(run().status).toBe(0);
    data.builds[0].explanation = null;
    writeFileSync(path, JSON.stringify(data));
    const invalid = run();
    expect(invalid.status).toBe(1);
  } finally { rmSync(root, { recursive: true, force: true }); }
});
