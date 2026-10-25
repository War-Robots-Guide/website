import aliases from '../data/equipment_aliases.json';

export function getEquipmentKey(name = '') {
  const key = name.toLowerCase().replace(/[^a-z0-9]/g, '')
    .replace(/^ultimate/, 'ue').replace(/swordunit$/, 'sword');
  return aliases[key] || key;
}
