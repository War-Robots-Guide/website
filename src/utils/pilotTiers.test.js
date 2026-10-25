import { describe, it, expect } from 'vitest';
import { validatePilotTiers } from './pilotTiers';
const sourceUrl = 'https://docs.google.com/spreadsheets/d/1RBLXWZDD-PmFxW4ChUOLNrzin8Gzxjp8tfw2gSeol8Y/edit#gid=0';
const valid = () => ({ schemaVersion: 1, sourceUrl, fetchedAt: '2026-10-25T04:00:00Z', tiers: [{ label: 'Hot', items: [{ name: 'Erika Storm' }] }] });
describe('pilot snapshot validation', () => {
  it('accepts preserved duplicate names across different tiers', () => {
    const data = valid(); data.tiers.push({ label: 'No', items: [{ name: 'Erika Storm' }] });
    expect(validatePilotTiers(data)).toEqual([]);
  });
  it.each([
    ['schemaVersion', true], ['schemaVersion', 2], ['sourceUrl', 'https://example.com'],
    ['fetchedAt', '2026-02-30T00:00:00Z'], ['fetchedAt', 'bad'], ['tiers', []],
    ['tiers', [{ label: '', items: [] }]], ['tiers', [{ label: 'Hot', items: [{ name: '' }] }]],
    ['tiers', [{ label: 'Hot', items: [{ name: 'A' }] }, { label: ' hot ', items: [{ name: 'B' }] }]],
  ])('rejects invalid %s (%j)', (key, value) => {
    expect(validatePilotTiers({ ...valid(), [key]: value }).length).toBeGreaterThan(0);
  });
  it.each([null, {}, { ...valid(), tiers: [null] }])('rejects malformed structure %j', data => {
    expect(validatePilotTiers(data).length).toBeGreaterThan(0);
  });
});
