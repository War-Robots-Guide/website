import { expect, it } from 'vitest';
import tiers from '../data/tiers.json';
import { getWeaponImage } from './imageUtils';

it('resolves every named weapon exposed by the tier-list family cards', () => {
  const missing = [];
  for (const category of ['Robot Weapons', 'Titan Weapons']) {
    for (const rank of Object.values(tiers[category])) {
      for (const item of rank.items) {
        for (const name of item.name.split(/[,/.]/).map(name => name.trim()).filter(Boolean)) {
          if (!getWeaponImage(name, category)) missing.push(name);
        }
      }
    }
  }
  expect(missing).toEqual([]);
});
