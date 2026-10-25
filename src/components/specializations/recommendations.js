const choice = (name, note = '') => ({ name, note });

// Recommendations, not all names mentioned in the guide's explanatory prose.
const recommendations = {
  'Damage Dealer/Raider (Robot)': [
    [choice('Nuclear Amplifier')],
    [choice('Rangefinder', 'Damage Dealer: 800m or more'), choice('Overdrive Unit', 'Damage Dealer: shorter range'),
      choice('Integrated Power Unit', 'Raider: powerful built-in weapon'), choice('Titan Slayer', 'Other Raiders')],
  ],
  'Brawler/Tank (Robot)': [
    [choice('Repair Amplifier', 'Brawler'), choice('Heavy Armor Kit', 'Tank')],
    [choice('Immune Amplifier', 'Brawler: sustained survival'), choice('Last Stand', 'Brawler: titan charging'), choice('Repair Amplifier', 'Tank')],
  ],
  'Support (Robot)': [[choice('Robot Accelerator')], [choice('Last Stand')]],
  'Saboteur (Robot)': [[choice('Beacon Operator')], [choice('Robot Accelerator')]],
  'Attack/Defense (Robot)': [
    [choice('Piercer Unit', 'Attack: against defense points'), choice('Thermonuclear Reactor', 'Attack: general use'), choice('Anticontrol', 'Defense')],
    [choice('Piercer Unit', 'Attack: against defense points'), choice('Thermonuclear Reactor', 'Attack: general use'), choice('Heavy Armor Kit', 'Defense')],
  ],
  'Damage Dealer (Titan)': [[choice('Titan Nuclear Amplifier')],
    [choice('Titan Overdrive Unit', 'General use'), choice('Cannibal Reactor', 'Long-range sniper builds')]],
  'Brawler/Tank (Titan)': [[choice('Titan Repair Amplifier'), choice('Damage Controller', 'Advanced Indra builds with ample healing')],
    [choice('Titan Anticontrol', 'Brawler'), choice('Titan Last Stand', 'Tank')]],
  'Attack (Titan)': [[choice('Onslaught Reactor')], [choice('Quantum Sensor')]],
  'Defense (Titan)': [],
  'Ultimate (Titan)': [
    [choice('Ultimate Titan Grand Balanced Reactor'), choice('Ultimate Plated Armor Kit'), choice('Ultimate Antimatter Reactor')],
    [choice('Ultimate Titan Nuclear Amplifier'), choice('Ultimate Titan Repair Amplifier')],
  ],
};

export function getSpecializationSlots(title, slots = []) {
  const choices = recommendations[title] || [];
  return Array.from({ length: Math.max(slots.length, choices.length) }, (_, index) => ({
    name: slots[index]?.name || (index === 0 ? 'First module slot' : 'Second module slot'),
    content: slots[index]?.content || '',
    recommendations: choices[index] || [],
  }));
}
