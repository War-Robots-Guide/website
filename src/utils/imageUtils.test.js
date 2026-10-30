import { describe, it, expect, vi } from 'vitest';

// Deployment regenerates this manifest from Drive. Keep lookup tests independent
// of additions, removals, and renames in that external image library.
vi.mock('../data/image_manifest.json', () => ({
  default: {
    items: {
      pathfinder: '/images/items/Pathfinder.png',
      ammit: '/images/items/Ammit.png',
      curie: '/images/items/Curie.png',
      swordunit: '/images/items/SWORD Unit.png',
      bulgasari: '/images/items/Bulgasari.png',
      uebulgasari: '/images/items/Ultimate Bulgasari.png',
      uesword: '/images/items/Ultimate SWORD.png',
      // Deliberately incorrect aliases exercise the Ultimate artwork guard.
      haechi: '/images/items/Ultimate Haechi.png',
    },
    all_files: {
      cossack: '/images/items/Cossack.png',
      fuijin: '/images/items/Fuijin.png',
      ultimatefujin: '/images/items/Ultimate Fujin.png',
      ultimateraven: '/images/items/Ultimate Raven.png',
      spectre: '/images/items/Ultimate Spectre.png',
    },
    weapons: {
      harmattanh: '/images/items/HarmattanH.png',
      harmattanm: '/images/items/HarmattanM.png',
      harmattanl: '/images/items/HarmattanL.png',
      lumenl: '/images/items/LumenL.png',
      iaraghil: '/images/items/IaraghL.png',
      barqa: '/images/items/BarqA.png',
    },
    pilots: {
      johnorsted: '/images/items/pilot_legend_john_orsted_mini.png',
    },
    drones: { freezo: '/images/items/Drone Freezo.png' },
    modules: {
      nuclearamplifier: '/images/items/Module_Passive Nuclear Amplifier.png',
      phaseshift: '/images/items/Module_Active Phase Shift.png',
      titanoverdriveunit: '/images/items/Titan Overdrive Unit.png',
      armorkit: '/images/items/Module_Passive Armor Kit.png',
      rangefinderunit: '/images/items/Module_Passive Rangefinder Unit.png',
    },
    icons: {
      support: '/images/icons/Support.png',
      tankbuster: '/images/icons/Tank Buster.png',
      sniper: '/images/icons/Sniper.png',
      midranger: '/images/icons/Midranger.png',
      brawler: '/images/icons/Brawler.png',
      beaconrunner: '/images/icons/Beacon Runner.png',
      assassin: '/images/icons/Assassin.png',
    },
    new_tier_items: ['Dedopali', 'Prena', 'Iaraghi L', 'Iaraghi M', 'Iaraghi H'],
    new_tier_items_by_category: { Robots: ['Dedopali'], Drones: ['Prena'], 'Robot Weapons': ['Iaraghi L', 'Iaraghi M', 'Iaraghi H'] },
  },
}));

vi.mock('../data/equipment_newness.json', () => ({ default: {
  version: '12.3', new_by_category: { Robots: ['Fang'], Titans: ['Sirocco'] },
} }));

vi.mock('../data/equipment_updates.json', () => ({ default: [
  { date: '2026-09-22', version: '12.4', items: { Robots: ['Dedopali'], Drones: ['Prena'], 'Robot Weapons': ['Iaraghi L', 'Iaraghi M', 'Iaraghi H'] } },
  { date: '2026-08-11', version: '12.3', items: { Robots: ['Fang'], Titans: ['Sirocco'], 'Robot Weapons': ['Harmattan L', 'Harmattan M', 'Harmattan H'] } },
] }));

import {
  cleanKey,
  extractTierTags,
  getRobotImage,
  getWeaponImage,
  getPilotImage,
  getDroneImage,
  getModuleImage,
  getRoleIcon,
  isNewTierItem,
} from './imageUtils';

describe('imageUtils', () => {
  it('cleans keys correctly', () => {
    expect(cleanKey('UE Raven')).toBe('ueraven');
    expect(cleanKey('Anti-Brawler Support')).toBe('antibrawlersupport');
    expect(cleanKey('Nuclear Amplifier')).toBe('nuclearamplifier');
  });

  it('resolves tier-only robots and the Fujin spelling variants', () => {
    expect(getRobotImage('Cossack')).toBe('/images/items/Cossack.png');
    expect(getRobotImage('Fuijin')).toBe('/images/items/Fuijin.png');
    expect(getRobotImage('UE Fuijin')).toBe('/images/items/Ultimate Fujin.png');
  });

  it('extracts tier tags and cleans name', () => {
    expect(extractTierTags('⬆️Fang')).toEqual({ cleanName: 'Fang', tags: ['⬆️'] });
    expect(extractTierTags('⬇️Dedopali')).toEqual({ cleanName: 'Dedopali', tags: ['⬇️'] });
    expect(extractTierTags('👁️Shoggoth')).toEqual({ cleanName: 'Shoggoth', tags: ['👁️'] });
    expect(extractTierTags('Pathfinder')).toEqual({ cleanName: 'Pathfinder', tags: [] });
  });

  it('maps standard and Ultimate robots to their own artwork when both exist', () => {
    expect(getRobotImage('Pathfinder')).toBe('/images/items/Pathfinder.png');
    expect(getRobotImage('Ammit')).toBe('/images/items/Ammit.png');
    expect(getRobotImage('Curie')).toBe('/images/items/Curie.png');
    expect(getRobotImage('UE Raven')).toBe('/images/items/Ultimate Raven.png');
    expect(getRobotImage('SWORD Unit')).toBe('/images/items/SWORD Unit.png');
    expect(getRobotImage('UE Bulgasari')).toBe('/images/items/Ultimate Bulgasari.png');
    expect(getRobotImage('Bulgasari')).toBe('/images/items/Bulgasari.png');
  });

  it('returns null for a standard robot when only its Ultimate artwork exists', () => {
    expect(getRobotImage('UE Raven')).toBe('/images/items/Ultimate Raven.png');
    expect(getRobotImage('Raven')).toBeNull();
  });

  it.each(['Haechi', 'Spectre'])('rejects Ultimate artwork indexed under the standard %s name', (name) => {
    expect(getRobotImage(name)).toBeNull();
  });

  it('identifies newest tier items', () => {
    expect(isNewTierItem('⬇️Dedopali')).toBe(true);
    expect(isNewTierItem('Dedopali')).toBe(true);
    expect(isNewTierItem('Destrier')).toBe(false);
  });

  it('maps pilots and drones', () => {
    expect(getPilotImage('John Orsted')).toBe('/images/items/pilot_legend_john_orsted_mini.png');
    expect(getDroneImage('Freezo')).toBe('/images/items/Drone Freezo.png');
  });

  it('maps modules', () => {
    expect(getModuleImage('Nuclear Amplifier')).toBe('/images/items/Module_Passive Nuclear Amplifier.png');
    expect(getModuleImage('Phase Shift')).toBe('/images/items/Module_Active Phase Shift.png');
  });

  it('uses exact module aliases and never substitutes Titan artwork for a robot', () => {
    expect(getModuleImage('Heavy Armor Kit')).toBe('/module-images/heavy-armor-kit.png');
    expect(getModuleImage('Rangefinder')).toContain('Rangefinder Unit.png');
    expect(getModuleImage('Titan Overdrive Unit')).toContain('Titan Overdrive Unit.png');
    expect(getModuleImage('Overdrive Unit')).not.toBe('/images/items/Titan Overdrive Unit.png');
    expect(getModuleImage('Unrelated Module')).toBeNull();
  });

  it('uses one Ultimate Sword image for all Sword name variants', () => {
    for (const name of ['UE Sword', 'UE Sword Unit', 'Ultimate Sword Unit']) {
      expect(getRobotImage(name)).toBe('/images/items/Ultimate SWORD.png');
    }
    expect(getRobotImage('Sword Unit')).toBe('/images/items/SWORD Unit.png');
  });

  it('maps weapons and resolves multi-weapon family entries', () => {
    expect(getWeaponImage('Harmattan', 'Heavy Weapons')).toBe('/images/items/HarmattanH.png');
    expect(getWeaponImage('Harmattan', 'Medium Weapons')).toBe('/images/items/HarmattanM.png');
    expect(getWeaponImage('Harmattan', 'Light Weapons')).toBe('/images/items/HarmattanL.png');
    // Tier list weapon families
    expect(getWeaponImage('Lumen L, Lumen M, Lumen H')).toBe('/images/items/LumenL.png');
    expect(getWeaponImage('👁️Iaraghi L, 👁️Iaraghi M, 👁️Iaraghi H')).toBe('/images/items/IaraghL.png');
    expect(getWeaponImage('Barq-a. Barq-b')).toBe('/images/items/BarqA.png');
  });

  it('maps role icons correctly and resolves aliases', () => {
    expect(getRoleIcon('Support')).toBe('/images/icons/Support.png');
    expect(getRoleIcon('Tank-buster')).toBe('/images/icons/Tank Buster.png');
    expect(getRoleIcon('Sniper')).toBe('/images/icons/Sniper.png');
    expect(getRoleIcon('Midrange')).toBe('/images/icons/Midranger.png');
    expect(getRoleIcon('Midranger')).toBe('/images/icons/Midranger.png');
    expect(getRoleIcon('Brawler')).toBe('/images/icons/Brawler.png');
    expect(getRoleIcon('Beacon Runner')).toBe('/images/icons/Beacon Runner.png');
    expect(getRoleIcon('Assassin')).toBe('/images/icons/Assassin.png');
  });
});

it('marks new equipment families in their own category, including tagged names', () => {
  expect(isNewTierItem('👁️Iaraghi L, 👁️Iaraghi M, 👁️Iaraghi H', 'Robot Weapons')).toBe(true);
  expect(isNewTierItem('Prena', 'Drones')).toBe(true);
  expect(isNewTierItem('Prena', 'Robots')).toBe(false);
  expect(isNewTierItem('Harmattan L, Harmattan M, Harmattan H', 'Robot Weapons')).toBe(false);
  expect(isNewTierItem('Fang', 'Robots')).toBe(false);
  expect(isNewTierItem('Sirocco', 'Titans')).toBe(false);
});

it('clears old badges when the latest update introduces no equipment', async () => {
  vi.resetModules();
  vi.doMock('../data/equipment_updates.json', () => ({ default: [
    { date: '2026-09-22', version: '12.4', items: { Robots: ['Dedopali'] } },
    { date: '2026-10-22', version: '12.5', items: {} },
  ] }));
  try {
    const { isNewTierItem: isNewAfterUpdate } = await import('./imageUtils');
    expect(isNewAfterUpdate('Dedopali', 'Robots')).toBe(false);
    expect(isNewAfterUpdate('Dedopali')).toBe(false);
    expect(isNewAfterUpdate('Fang', 'Robots')).toBe(false);
  } finally {
    vi.doUnmock('../data/equipment_updates.json');
    vi.resetModules();
  }
});
