import { expect, it } from 'vitest';
import guide from '../data/robot_guide.json';
import { parseBuildSpecialization, parseEquipmentOptions } from './buildEquipment';
import { getModuleImage } from './imageUtils';
import { ACTIVE_MODULE_NAMES } from './moduleCatalog';

it('resolves every concrete module in the current build guide to its own artwork', () => {
  const missing = [];
  for (const build of guide.builds) {
    const parsed = parseBuildSpecialization(build.specialization, build.is_titan);
    expect(parsed.active.every(option => ACTIVE_MODULE_NAMES.has(option.name)), build.robot).toBe(true);
    for (const module of [...parsed.passive.flatMap(option => option.modules), ...parsed.active.map(option => option.name)]) {
      if (!/^any$/i.test(module) && !getModuleImage(module)) missing.push(`${build.robot}: ${module}`);
    }
  }
  expect(missing).toEqual([]);
});

it('never renders a wrapped parenthetical note as a separate equipment name', () => {
  for (const build of guide.builds) {
    for (const [field, kind] of [['pilot', 'pilot'], ['drone_options', 'drone']]) {
      const options = parseEquipmentOptions(build[field] || '', kind);
      expect(options.filter(option => /[()]/.test(option.name)), `${build.robot}: ${field}`).toEqual([]);
    }
  }
});
