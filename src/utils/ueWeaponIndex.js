import { getEquipmentKey } from './equipmentNames';

const guideWeaponNames = { molot: 'Molot T', punisher: 'Punisher T' };

export function getIndexWeaponNames(category, index, visited = new Set()) {
  if (visited.has(category)) return [];
  const seenCategories = new Set([...visited, category]);
  const names = category.toLowerCase() === 'any'
    ? Object.keys(index).filter(name => name.toLowerCase() !== 'any')
      .flatMap(name => getIndexWeaponNames(name, index, seenCategories))
    : (index[category] || '').replace(/\([^)]*\)/g, '').split(/[,/]/).flatMap(part => {
      const name = part.replace(/["“”]/g, '').trim();
      if (!name) return [];
      const reference = name.match(/^(?:UE\s+)?(.+?)\s+Setups$/i);
      if (reference) {
        const referencedCategory = Object.keys(index).find(key => key.toLowerCase() === reference[1].toLowerCase());
        return referencedCategory ? getIndexWeaponNames(referencedCategory, index, seenCategories) : [];
      }
      const baseName = name.replace(/^(?:UE|Ultimate)\s+/i, '');
      return [`UE ${guideWeaponNames[getEquipmentKey(baseName)] || baseName}`];
    });
  const seenWeapons = new Set();
  return names.filter(name => {
    const key = getEquipmentKey(name);
    if (seenWeapons.has(key)) return false;
    seenWeapons.add(key);
    return true;
  });
}
