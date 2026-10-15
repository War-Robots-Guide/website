import { describe, it, expect } from 'vitest';
import { extractModules } from './moduleUtils';
import { getModuleImage } from './imageUtils';

describe('Specialization modules', () => {
  it('does not duplicate shorter names inside Titan module names', () => {
    expect(extractModules('Titan Repair Amplifier and Titan Last Stand', true)).toEqual(['Titan Repair Amplifier', 'Titan Last Stand']);
  });
  it('resolves shorthand module names in Titan sections to Titan artwork', () => {
    const modules = extractModules('Nuclear Amplifier, Overdrive', true);
    expect(modules).toEqual(['Titan Nuclear Amplifier', 'Titan Overdrive Unit']);
    expect(getModuleImage(modules[0])).toContain('Titan Nuclear Amplifier.png');
    expect(getModuleImage(modules[1])).toContain('Titan Overdrive Unit.png');
    expect(extractModules('Repair Amplifier', false)).toEqual(['Repair Amplifier']);
  });
});
