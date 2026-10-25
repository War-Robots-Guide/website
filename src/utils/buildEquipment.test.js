import { describe, expect, it } from 'vitest';
import { parseEquipmentOptions, parseBuildSpecialization } from './buildEquipment';

describe('build equipment parsing', () => {
  it('keeps wrapped drone notes attached to the named option', () => {
    expect(parseEquipmentOptions('Solar\nAopo\n(Use Aopo for\nGauss+Weber)', 'drone')).toEqual([
      { name: 'Solar', note: '' }, { name: 'Aopo', note: 'Use Aopo for Gauss+Weber' },
    ]);
    expect(parseEquipmentOptions('Solar \nPrena (With\nGauss/Volt)', 'drone')[1]).toEqual({ name: 'Prena', note: 'With Gauss/Volt' });
  });
  it('joins wrapped pilot names and retains separate choices and conditions', () => {
    expect(parseEquipmentOptions('Sati "Cat" \nFelidae', 'pilot')).toEqual([{ name: 'Sati "Cat" Felidae', note: '' }]);
    expect(parseEquipmentOptions('Otto Schreyer\n(With Arms)\nWeapon Pilot\n(other weapons)\nShani Kyne\n(if you have)', 'pilot')).toEqual([
      { name: 'Otto Schreyer', note: 'With Arms' }, { name: 'Weapon Pilot', note: 'other weapons' }, { name: 'Shani Kyne', note: 'if you have' },
    ]);
    expect(parseEquipmentOptions('Walter Trommel\nBasil Lapatte\nHarold Han\n(With K-lasers)', 'pilot')).toHaveLength(3);
  });
  it('does not discard unmatched names or notes', () => {
    expect(parseEquipmentOptions('Future Pilot\n(Only with new weapons)', 'pilot')).toEqual([{ name: 'Future Pilot', note: 'Only with new weapons' }]);
    expect(parseEquipmentOptions('N/A', 'drone')).toEqual([]);
  });
  it('separates passive specializations from active alternatives and expands aliases', () => {
    expect(parseBuildSpecialization('Support (Accelerator +\nLast Stand)\nRepair or Phase Shift')).toEqual({
      passive: [{ name: 'Support', modules: ['Robot Accelerator', 'Last Stand'] }],
      active: [{ name: 'Repair Unit', note: '' }, { name: 'Phase Shift', note: '' }],
    });
    expect(parseBuildSpecialization('Damage Dealer (TNA+ODU)\nAttack (Onslaught+Quantum)', true).passive).toEqual([
      { name: 'Damage Dealer', modules: ['Titan Nuclear Amplifier', 'Titan Overdrive Unit'] },
      { name: 'Attack', modules: ['Onslaught Reactor', 'Quantum Sensor'] },
    ]);
    expect(parseBuildSpecialization('Ultimate (BU+TRA)', true).passive[0].modules).toEqual(['Ultimate Titan Grand Balanced Reactor', 'Ultimate Titan Repair Amplifier']);
    expect(parseBuildSpecialization('Raider (Nuke Amp + Any)\nPhase Shift or Lockdown\nAmmo').active.map(x => x.name)).toEqual(['Phase Shift', 'Lock Down Ammo']);
    expect(parseBuildSpecialization('Brawler (Repair Amp +\nIA/LS)\nAdv. Repair').passive[0].modules).toEqual(['Repair Amplifier', 'Immune Amplifier', 'Last Stand']);
  });
  it('interprets robot-active QS as Quantum Radar while preserving Titan Quantum Sensor', () => {
    const parsed = parseBuildSpecialization('Raider (Nuke Amp + Integrated)\nPhase Shift, SB, or QS');
    expect(parsed.active.map(option => option.name)).toEqual(['Phase Shift', 'Shieldbreaker', 'Quantum Radar']);
    expect(parseBuildSpecialization('Attack (Onslaught+Quantum)', true).passive[0].modules).toContain('Quantum Sensor');
  });
});
