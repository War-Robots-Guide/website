import guide from '../data/robot_guide.json';
import equipmentRarities from '../data/equipment_rarities.json';
import { cleanKey, extractTierTags } from './imageUtils';
import { getEquipmentKey } from './equipmentNames';

// Equipment rarity is independent of the power ranking (X–Z).
const rarities = Object.fromEntries(guide.robots.map(robot => [cleanKey(robot.name),
  robot.sheet.includes('Ultimate') ? 'ultimate' : robot.sheet.includes('Tier 3') ? 3 : 4]));
const legacyRobots = {
  1: 'Destrier,Cossack,Schutze,Gepard,GI Patton,Vityaz,Golem,Boa,Leo,Natasha',
  2: 'Griffin,Rogatka,Rhino,Stalker,Carnage,Fuijin,Fujin,Raijin,Gareth,Galahad,Lancelot,Jesse,Doc,Butch,Bolt,Kumiho,Hover,Ao Qin',
};
for (const [tier, names] of Object.entries(legacyRobots)) {
  for (const name of names.split(',')) rarities[cleanKey(name)] = Number(tier);
}
const titanRarities = { kid: 1, arthur: 2, aoming: 2, minos: 3, nodens: 3, murometz: 3, sharanga: 3 };
const colors = { 1: '#94a3b8', 2: '#3b82f6', 3: '#a855f7', 4: '#f59e0b', ultimate: '#eab308' };
const equipmentTiers = Object.fromEntries(Object.entries(equipmentRarities).map(([category, groups]) => [
  category, Object.fromEntries(Object.entries(groups).flatMap(([tier, names]) => names.map(name => [getEquipmentKey(name), Number(tier)]))),
]));

export function getEquipmentAppearance(name, category) {
  const { cleanName } = extractTierTags(name);
  const key = cleanKey(cleanName);
  const ultimate = /^(ue|ultimate)\s/i.test(cleanName);
  // Family portraits use the first member, matching getWeaponImage's lookup.
  const firstMemberKey = getEquipmentKey(cleanName.split(/[,/.]/)[0]);
  const tier = ultimate ? 'ultimate' : category === 'Robots' ? (rarities[key] ?? null)
    : category === 'Titans' ? (titanRarities[key] || 4)
    : (equipmentTiers[category]?.[firstMemberKey] ?? null);
  const color = colors[tier] || '#64748b';
  return { tier, color, background: `linear-gradient(135deg, ${color}66, ${color}22)` };
}

export function getUnitType(unit, category) {
  if (category === 'robots') return unit.sheet;
  const { tier } = getEquipmentAppearance(unit.name, 'Titans');
  return tier === 'ultimate' ? 'Ultimate Titans' : `Tier ${tier} Titans`;
}
