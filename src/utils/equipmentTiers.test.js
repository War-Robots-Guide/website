import { describe, it, expect } from 'vitest';
import { getEquipmentAppearance } from './equipmentTiers';

describe('Equipment rarity colors', () => {
  it('uses the robot equipment tier, including legacy and Ultimate units', () => {
    expect(getEquipmentAppearance('⬇️Fenrir', 'Robots').tier).toBe(3);
    expect(getEquipmentAppearance('Pathfinder', 'Robots').tier).toBe(4);
    expect(getEquipmentAppearance('Destrier', 'Robots').tier).toBe(1);
    expect(getEquipmentAppearance('UE Raven', 'Robots').tier).toBe('ultimate');
    expect(getEquipmentAppearance('Pathfinder', 'Robots').color).toBe('#f59e0b');
  });

  it.each([
    ['Punisher', 'Robot Weapons', 1, '#94a3b8'],
    ['Trebuchet', 'Robot Weapons', 2, '#3b82f6'],
    ['Calamity, Scourge, Spark', 'Robot Weapons', 3, '#a855f7'],
    ['Iaraghi L, Iaraghi M, Iaraghi H', 'Robot Weapons', 4, '#f59e0b'],
    ['UE Toxin, UE Venom', 'Robot Weapons', 'ultimate', '#eab308'],
    ['Retaliator, Vengeance', 'Titan Weapons', 1, '#94a3b8'],
    ['Rupture, Tsar', 'Titan Weapons', 2, '#3b82f6'],
    ['Cataclysm, Cyclone', 'Titan Weapons', 3, '#a855f7'],
    ['Barq-a. Barq-b', 'Titan Weapons', 4, '#f59e0b'],
    ['Defender', 'Drones', 1, '#94a3b8'],
    ['Discus', 'Drones', 2, '#3b82f6'],
    ['Whiteout', 'Drones', 3, '#a855f7'],
    ['Prena', 'Drones', 4, '#f59e0b'],
    ['Dreadnought A42', 'Motherships', 1, '#94a3b8'],
    ['Mantis', 'Motherships', 2, '#3b82f6'],
    ['Monarch', 'Motherships', 3, '#a855f7'],
    ['Avalon', 'Motherships', 4, '#f59e0b'],
    ['Target Ray Cannon', 'Mothership Turrets', 1, '#94a3b8'],
    ['Lifesaver', 'Mothership Turrets', 4, '#f59e0b'],
  ])('colors %s by equipment rarity', (name, category, tier, color) => {
    expect(getEquipmentAppearance(name, category)).toMatchObject({ tier, color });
  });

  it('keeps unknown equipment neutral', () => {
    expect(getEquipmentAppearance('Unknown item', 'Drones').tier).toBeNull();
  });
});
