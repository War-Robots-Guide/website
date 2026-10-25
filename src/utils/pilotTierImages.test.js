import { describe, it, expect, vi } from 'vitest';
import { getPilotTierImage } from './pilotTierImages';
vi.mock('../data/image_manifest.json', () => ({ default: { pilots: {
  erikastorm: '/erika.png', sophiekovac: '/sophie.png', yanglee: '/yang.png',
  twins: '/twins.png', satifelidae: '/cat.png',
} } }));
describe('pilot tier portraits', () => {
  it('matches normalized exact names without changing accented display names', () => {
    expect(getPilotTierImage('Erika Storm')).toBe('/erika.png');
    expect(getPilotTierImage('Sophie Kovač')).toBe('/sophie.png');
  });
  it('resolves verified existing aliases', () => {
    expect(getPilotTierImage('[REDACTED] Twins')).toBe('/twins.png');
    expect(getPilotTierImage('Sati "Cat" Felidae')).toBe('/cat.png');
  });
  it('does not substitute another variant or guess missing names', () => {
    expect(getPilotTierImage('Yang Lee Titan')).toBeNull();
    expect(getPilotTierImage('Yang Lee (Harpy / Siren)')).toBeNull();
    expect(getPilotTierImage('Missing Pilot')).toBeNull();
    expect(getPilotTierImage('')).toBeNull();
  });
});
