import { expect, it } from 'vitest';
import { getIndexWeaponNames } from './ueWeaponIndex';

const index = {
  Midrange: 'Pulsar, Molot, ArmM',
  Burst: 'Storm, Glory, ArmM (some midrange weapons are also burst weapons)',
  'Close Range': '"UE Burst Setups", Punisher/Avenger, Venom/Toxin (only use with Shieldbreak or Webby)',
  Any: 'Anything goes.',
};

it('resolves guide abbreviations to Ultimate weapon names', () => {
  expect(getIndexWeaponNames('Midrange', index)).toEqual(['UE Pulsar', 'UE Molot T', 'UE ArmM']);
});

it('expands category references and slash-separated weapons without including notes', () => {
  expect(getIndexWeaponNames('Close Range', index)).toEqual([
    'UE Storm', 'UE Glory', 'UE ArmM', 'UE Punisher T', 'UE Avenger', 'UE Venom', 'UE Toxin',
  ]);
});

it('uses the listed weapons without duplicates for Any setups', () => {
  expect(getIndexWeaponNames('Any', index)).toEqual([
    'UE Pulsar', 'UE Molot T', 'UE ArmM', 'UE Storm', 'UE Glory', 'UE Punisher T', 'UE Avenger', 'UE Venom', 'UE Toxin',
  ]);
});

it('handles empty lists and circular setup references', () => {
  expect(getIndexWeaponNames('Missing', index)).toEqual([]);
  expect(getIndexWeaponNames('Burst', { Burst: '"UE Close Range Setups", Storm', 'Close Range': '"UE Burst Setups", Glory' }))
    .toEqual(['UE Glory', 'UE Storm']);
});
