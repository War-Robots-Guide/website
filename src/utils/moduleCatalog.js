// Explicit aliases only: robot, Titan and Ultimate modules never substring-match.
export const MODULE_NAMES = [
  'Nuclear Amplifier', 'Repair Amplifier', 'Immune Amplifier', 'Last Stand',
  'Anticontrol', 'Overdrive Unit', 'Self Fix Unit', 'Heavy Armor Kit',
  'Robot Accelerator', 'Rangefinder', 'Integrated Power Unit', 'Titan Slayer',
  'Beacon Operator', 'Cloaking Unit', 'Fortifier', 'Defence Unit',
  'Piercer Unit', 'Thermonuclear Reactor', 'Onslaught Unit',
  'Onslaught Reactor', 'Quantum Sensor', 'Cannibal Reactor', 'Damage Controller',
  'Titan Nuclear Amplifier', 'Titan Repair Amplifier', 'Titan Immune Amplifier',
  'Titan Last Stand', 'Titan Anticontrol', 'Titan Overdrive Unit', 'Titan Self Fix Unit',
  'Ultimate Plated Armor Kit', 'Ultimate Antimatter Reactor', 'Grand Balanced Reactor',
  'Ultimate Titan Nuclear Amplifier', 'Ultimate Titan Repair Amplifier',
  'Ultimate Titan Grand Balanced Reactor',
  'Repair Unit', 'Advanced Repair Unit', 'Phase Shift', 'Unstable Conduit',
  'Quantum Radar', 'Shieldbreaker', 'Jump Unit', 'Lock Down Ammo', 'Death Mark',
];

export const moduleKey = value => value.toLowerCase().replace(/[^a-z0-9]/g, '');
const aliases = {
  nukeamp: 'Nuclear Amplifier', repairamp: 'Repair Amplifier', immuneamp: 'Immune Amplifier',
  tna: 'Titan Nuclear Amplifier', tra: 'Titan Repair Amplifier', tls: 'Titan Last Stand',
  ia: 'Immune Amplifier', ls: 'Last Stand', odu: 'Overdrive Unit', overdrive: 'Overdrive Unit',
  accelerator: 'Robot Accelerator', acceleratorunit: 'Robot Accelerator',
  beaconop: 'Beacon Operator', integrated: 'Integrated Power Unit', ipu: 'Integrated Power Unit',
  onslaught: 'Onslaught Reactor', quantum: 'Quantum Sensor', qs: 'Quantum Sensor', cannibal: 'Cannibal Reactor',
  bu: 'Grand Balanced Reactor', platedarmor: 'Ultimate Plated Armor Kit', antimatter: 'Ultimate Antimatter Reactor',
  repair: 'Repair Unit', advancedrepair: 'Advanced Repair Unit', advrepair: 'Advanced Repair Unit',
  phase: 'Phase Shift', uc: 'Unstable Conduit', qr: 'Quantum Radar',
  sb: 'Shieldbreaker', shieldbreak: 'Shieldbreaker', lockdownammo: 'Lock Down Ammo',
};
const canonicalNames = Object.fromEntries(MODULE_NAMES.map(name => [moduleKey(name), name]));
const titanModules = new Set(['Nuclear Amplifier', 'Repair Amplifier', 'Immune Amplifier', 'Last Stand', 'Anticontrol', 'Overdrive Unit', 'Self Fix Unit']);
export const ACTIVE_MODULE_NAMES = new Set(['Repair Unit', 'Advanced Repair Unit', 'Phase Shift', 'Unstable Conduit', 'Quantum Radar', 'Shieldbreaker', 'Jump Unit', 'Lock Down Ammo', 'Death Mark']);

export function resolveModuleName(value, isTitan = false, ultimate = false) {
  const key = moduleKey(value);
  let name = aliases[key] || canonicalNames[key] || value.trim();
  if (isTitan && titanModules.has(name)) name = `Titan ${name}`;
  if (ultimate && ['Titan Nuclear Amplifier', 'Titan Repair Amplifier', 'Grand Balanced Reactor'].includes(name)) name = `Ultimate ${name === 'Grand Balanced Reactor' ? 'Titan ' : ''}${name}`;
  return name;
}

export const MODULE_IMAGE_KEYS = {
  rangefinder: 'rangefinderunit',
};
