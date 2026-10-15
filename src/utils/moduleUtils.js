const names = [
  'Ultimate Titan Nuclear Amplifier', 'Ultimate Titan Repair Amplifier', 'Ultimate Titan Balanced Unit',
  'Ultimate Titan Plated Armor', 'Ultimate Titan Grand Balanced Reactor',
  'Titan Nuclear Amplifier', 'Titan Repair Amplifier', 'Titan Immune Amplifier', 'Titan Last Stand',
  'Titan Anticontrol', 'Titan Accelerator', 'Titan Overdrive Unit', 'Titan Self Fix Unit',
  'Advanced Repair Unit', 'Robot Accelerator', 'Nuclear Amplifier', 'Repair Amplifier',
  'Immune Amplifier', 'Last Stand', 'Anticontrol', 'Overdrive Unit', 'Self Fix Unit',
  'Heavy Armor Kit', 'Cannibal Reactor', 'Quantum Sensor', 'Integrated Power Unit',
  'Titan Slayer', 'Rangefinder', 'Beacon Operator', 'Cloaking Unit', 'Damage Controller',
  'Fortifier', 'Phase Shift', 'Repair Unit', 'Onslaught Reactor', 'Onslaught', 'Cannibal', 'Accelerator', 'Overdrive',
];
export function extractModules(text = '', isTitan = false) {
  let remaining = text.toLowerCase();
  const found = [];
  for (const name of [...names].sort((a, b) => b.length - a.length)) {
    if (!isTitan && ['Onslaught', 'Cannibal'].includes(name)) continue;
    if (!remaining.includes(name.toLowerCase())) continue;
    remaining = remaining.replaceAll(name.toLowerCase(), '');
    let resolved = name === 'Onslaught' ? 'Onslaught Reactor' : name === 'Cannibal' ? 'Cannibal Reactor' : name;
    if (isTitan && ['Nuclear Amplifier', 'Repair Amplifier', 'Immune Amplifier', 'Last Stand', 'Anticontrol', 'Self Fix Unit'].includes(name)) resolved = `Titan ${name}`;
    if (isTitan && ['Overdrive', 'Overdrive Unit'].includes(name)) resolved = 'Titan Overdrive Unit';
    if (!found.includes(resolved)) found.push(resolved);
  }
  return found;
}
