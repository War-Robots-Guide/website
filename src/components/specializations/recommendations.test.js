import { expect, it } from 'vitest';
import { getSpecializationSlots } from './recommendations';

it('omits modules mentioned only as rejected alternatives', () => {
  const slots = getSpecializationSlots('Support (Robot)', [{ name: 'First module slot', content: 'Repair Amplifier is tempting, but take Accelerator.' }, { name: 'Second module slot', content: 'Last Stand over Cloaking Unit.' }]);
  expect(slots.map(slot => slot.recommendations.map(x => x.name))).toEqual([['Robot Accelerator'], ['Last Stand']]);
});
it('defines Ultimate slots and preserves their correct module classes', () => {
  const slots = getSpecializationSlots('Ultimate (Titan)');
  expect(slots).toHaveLength(2);
  expect(slots[1].recommendations.map(x => x.name)).toEqual(['Ultimate Titan Nuclear Amplifier', 'Ultimate Titan Repair Amplifier']);
});
