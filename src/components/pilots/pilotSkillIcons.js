// The source artwork groups several skills into a single icon file.
const groups = [
  ['Mechanic, Wonderworker, Adamant Mechanic, Raider Mechanic, True Ace.png', ['Mechanic', 'Wonderworker', 'True Ace']],
  ['Armor Expert, Cautious Pilot, Tough Guy, Traditionalist, Customization Adept.png', ['Armor Expert', 'Cautious Pilot', 'Tough Guy', 'Tough Guy and Customization Adept', 'Cautious Pilot and Customization Adept']],
  ['Road Hog, Spy, Scout, Stubborn Speedster (ROBOTS AND TITANS) Engine Expert (ONLY TITANS).png', ['Road Hog', 'Spy and Scout', 'Stubborn Speedster', 'Adamant Road Hog']],
  ['Modules Expert, Powerman, Dodger, Clever Survivor, Deft Survivor, Foolhardy Quartermaster.png', ['Modules Expert', 'Powerman', 'Dodger', 'Deft/Clever Survivor', 'Foolhardy Quartermaster']],
  ['Defense Expert, Ferocious Guardian (titans).png', ['Defense Expert, Ferocious Guardian'], 'titans'],
  ['Defense Expert, Ferocious Guardian, Engine Expert (ROBOTS) Traditionalist, Daredevil, Ghost (TITANS).png', ['Engine Expert, Defense Expert, Ferocious Guardian', 'Traditionalist, Daredevil, Ghost']],
  ['Energy Shield Expert, Crazy Electrician.png', ['Energy Shield Expert/Crazy Electrician']],
  ['Knight Errant, Physical Shield Expert, Hoplite.png', ['Knight Errant', 'Physical Shield Expert', 'Hoplite']],
  ['Master Gunsmith, Gunsmith, Berserker.png', ['Master Gunsmith', 'Gunsmith (Weapon Specific)', 'Berserker']],
  ['Opportunist skills, Bounty hunter.png', ['"Opportunist" skills, Bounty hunter', 'Bounty Hunter', 'Wise Opportunist', 'Cunning Opportunist']],
  ['Adamant skiks, Ninja, Raider skills.png', ['Invulnerable Raider', 'Raider Mechanic, Ninja', '"Adamant" skills', '"Raider" skills, Ninja', 'Adamant Mechanic, Adamant Gunsmith']],
  ['Generalist, Heavyweight Battler, Rationalist, Hothead.png', ['Generalist, Heavyweight Battler, Rationalist, Hothead']],
  ...['Destroyer', 'Explosives Expert', 'Guidance Operator', 'Jaeger', 'Quartermaster', 'Sharpshooter', 'Speed Shooter', 'Stubborn Warrior', 'Suppressor', 'Titan Master', 'Titan Slayer', 'True Cowboy'].map(name => [`${name}.png`, [name]]),
];

export function getPilotSkillIcons(name, section) {
  if (name === 'Engine Expert' && section === 'titans') return [groups[2][0]];
  const files = groups.filter(([, names, only]) => (!only || only === section) && names.includes(name)).map(([file]) => file);
  return [...new Set(files)];
}
