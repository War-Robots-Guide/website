import { describe, it, expect } from 'vitest';
import {
  cleanKey,
  extractTierTags,
  getRobotImage,
  getWeaponImage,
  getPilotImage,
  getDroneImage,
  getModuleImage,
  isNewTierItem,
} from './imageUtils';

describe('imageUtils', () => {
  it('cleans keys correctly', () => {
    expect(cleanKey('UE Raven')).toBe('ueraven');
    expect(cleanKey('Anti-Brawler Support')).toBe('antibrawlersupport');
    expect(cleanKey('Nuclear Amplifier')).toBe('nuclearamplifier');
  });

  it('extracts tier tags and cleans name', () => {
    expect(extractTierTags('⬆️Fang')).toEqual({ cleanName: 'Fang', tags: ['⬆️'] });
    expect(extractTierTags('⬇️Dedopali')).toEqual({ cleanName: 'Dedopali', tags: ['⬇️'] });
    expect(extractTierTags('👁️Shoggoth')).toEqual({ cleanName: 'Shoggoth', tags: ['👁️'] });
    expect(extractTierTags('Pathfinder')).toEqual({ cleanName: 'Pathfinder', tags: [] });
  });

  it('maps robot images to their exact files and prevents non-ultimates from using ultimate artwork', () => {
    expect(getRobotImage('Pathfinder')).toBe('/images/items/Pathfinder.png');
    expect(getRobotImage('Ammit')).toBe('/images/items/Ammit.png');
    expect(getRobotImage('Curie')).toBe('/images/items/Curie.png');
    expect(getRobotImage('UE Raven')).toBe('/images/items/Ultimate Raven.png');
    expect(getRobotImage('SWORD Unit')).toBe('/images/items/SWORD Unit.png');
    expect(getRobotImage('UE Bulgasari')).toBe('/images/items/Ultimate Bulgasari.png');
    // Non-ultimate Bulgasari has no non-ultimate image in ALL ITEMS, must NEVER use Ultimate Bulgasari!
    expect(getRobotImage('Bulgasari')).toBeNull();
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

  it('maps weapons and resolves multi-weapon family entries', () => {
    expect(getWeaponImage('Harmattan', 'Heavy Weapons')).toBe('/images/items/HarmattanH.png');
    expect(getWeaponImage('Harmattan', 'Medium Weapons')).toBe('/images/items/HarmattanM.png');
    expect(getWeaponImage('Harmattan', 'Light Weapons')).toBe('/images/items/HarmattanL.png');
    // Tier list weapon families
    expect(getWeaponImage('Lumen L, Lumen M, Lumen H')).toBe('/images/items/LumenL.png');
    expect(getWeaponImage('👁️Iaraghi L, 👁️Iaraghi M, 👁️Iaraghi H')).toBe('/images/items/IaraghL.png');
    expect(getWeaponImage('Barq-a. Barq-b')).toBe('/images/items/BarqA.png');
  });
});
