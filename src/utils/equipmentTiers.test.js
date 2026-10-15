import { describe, it, expect } from 'vitest';
import { getEquipmentAppearance } from './equipmentTiers';

describe('Equipment rarity colors', () => {
  it('uses the robot equipment tier, including legacy and Ultimate units', () => {
    expect(getEquipmentAppearance('⬇️Fenrir', 'Robots').tier).toBe(3);
    expect(getEquipmentAppearance('Pathfinder', 'Robots').tier).toBe(4);
    expect(getEquipmentAppearance('Destrier', 'Robots').tier).toBe(1);
    expect(getEquipmentAppearance('UE Raven', 'Robots').tier).toBe('ultimate');
    expect(getEquipmentAppearance('Pathfinder', 'Robots').color).toBe('#eab308');
  });
});
