import imageManifest from '../data/image_manifest.json';
import equipmentUpdates from '../data/equipment_updates.json';
import equipmentAliases from '../data/equipment_aliases.json';
import { getEquipmentKey } from './equipmentNames';
import { MODULE_IMAGE_KEYS, moduleKey, resolveModuleName } from './moduleCatalog';

export function cleanKey(str) {
  if (!str) return '';
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function extractTierTags(name) {
  if (!name) return { cleanName: '', tags: [] };
  const tags = [];
  const tagChars = [
    { char: '⬆️', type: 'up' },
    { char: '⬇️', type: 'down' },
    { char: '👁️', type: 'eye' },
    { char: '👥', type: 'squad' },
    { char: '‼️', type: 'warning' },
  ];

  let cleanName = name;
  for (const { char } of tagChars) {
    if (cleanName.includes(char)) {
      tags.push(char);
      cleanName = cleanName.replaceAll(char, '');
    }
  }

  // Also strip footnotes/asterisks
  cleanName = cleanName.replace(/\*+/g, '').trim();

  return { cleanName, tags };
}

export function getUnitKey(name) {
  return getEquipmentKey(extractTierTags(name).cleanName);
}

export function getRobotImage(name) {
  if (!name) return null;
  const { cleanName } = extractTierTags(name);
  const isUe = cleanName.toLowerCase().startsWith('ue ') || cleanName.toLowerCase().startsWith('ultimate ');
  const baseName = isUe ? cleanName.replace(/^ue\s+/i, '').replace(/^ultimate\s+/i, '').trim() : cleanName;
  const k = cleanKey(cleanName);
  const baseK = cleanKey(baseName).replace('fuijin', 'fujin').replace(/swordunit$/, 'sword');

  if (isUe) {
    if (imageManifest.items?.[`ultimate${baseK}`]) {
      return imageManifest.items[`ultimate${baseK}`];
    }
    if (imageManifest.items?.[`ue${baseK}`]) {
      return imageManifest.items[`ue${baseK}`];
    }
    if (imageManifest.items?.[k]) {
      return imageManifest.items[k];
    }
    return imageManifest.all_files?.[`ultimate${baseK}`] || imageManifest.all_files?.[`ue${baseK}`] || null;
  }

  // Non-Ultimate Robot: MUST NOT return an Ultimate image!
  const standardKey = k === 'sword' ? 'swordunit' : k;
  const img = imageManifest.items?.[standardKey] || imageManifest.all_files?.[standardKey] || imageManifest.all_files?.[k.replace('fujin', 'fuijin')];
  if (img) {
    const filename = img.split('/').pop().toLowerCase();
    if (filename.startsWith('ultimate')) {
      return null;
    }
    return img;
  }

  return null;
}

export function getWeaponImage(name, weightClass = '') {
  if (!name) return null;
  const { cleanName } = extractTierTags(name);

  // In tier lists and builds, weapon entries may be families, e.g. "Lumen L, Lumen M, Lumen H"
  const rawParts = cleanName.split(/[,/.]/).map(p => p.trim()).filter(Boolean);
  const parts = rawParts.length > 0 ? rawParts : [cleanName];

  for (const part of parts) {
    const isUe = part.toLowerCase().startsWith('ue ') || part.toLowerCase().startsWith('ultimate ');
    const baseName = isUe ? part.replace(/^ue\s+/i, '').replace(/^ultimate\s+/i, '').replace(/\s*\(.*?\)/g, '').trim() : part.replace(/\s*\(.*?\)/g, '').trim();
    const pk = cleanKey(part);
    const bk = getEquipmentKey(baseName);

    let suffix = '';
    if (weightClass.includes('Heavy')) suffix = 'h';
    else if (weightClass.includes('Medium')) suffix = 'm';
    else if (weightClass.includes('Light')) suffix = 'l';
    else if (weightClass.includes('Alpha')) suffix = 'a';
    else if (weightClass.includes('Beta')) suffix = 'b';

    const candidates = [];
    if (isUe) {
      candidates.push(`ultimate${bk}`);
      candidates.push(`ue${bk}`);
      candidates.push(`ultimate${pk}`);
      candidates.push(pk);
    } else {
      if (suffix) {
        candidates.push(`${bk}_${suffix}`);
        candidates.push(`${bk}${suffix}`);
        candidates.push(`${pk}_${suffix}`);
        candidates.push(`${pk}${suffix}`);
      }
      candidates.push(pk);
      candidates.push(bk);
      // Try with all suffixes if in tier list
      candidates.push(`${bk}h`);
      candidates.push(`${bk}m`);
      candidates.push(`${bk}l`);
      candidates.push(`${bk}a`);
      candidates.push(`${bk}b`);
    }

    candidates.push(...Object.keys(equipmentAliases).filter(alias => equipmentAliases[alias] === bk).map(alias => isUe ? `ultimate${alias}` : alias));
    for (const c of candidates) {
      const match = imageManifest.weapons?.[c] || imageManifest.all_files?.[c];
      if (match) {
        const fn = match.split('/').pop().toLowerCase();
        // Enforce UE consistency
        if (!isUe && fn.startsWith('ultimate')) {
          continue;
        }
        return match;
      }
    }
  }

  return null;
}

export function getPilotImage(name) {
  if (!name || name === 'N/A' || name.toLowerCase().includes('weapon pilot')) return null;
  const k = cleanKey(name);
  if (imageManifest.pilots?.[k]) {
    return imageManifest.pilots[k];
  }
  for (const [pk, path] of Object.entries(imageManifest.pilots || {})) {
    if (k.includes(pk) || pk.includes(k)) {
      return path;
    }
  }
  return null;
}

export function getDroneImage(name) {
  if (!name || name === 'N/A') return null;
  const clean = name.replace(/\(.*?\)/g, '').split('/')[0].split(',')[0].trim();
  const k = cleanKey(clean);
  if (imageManifest.drones?.[k]) {
    return imageManifest.drones[k];
  }
  for (const [dk, path] of Object.entries(imageManifest.drones || {})) {
    if (k.includes(dk) || dk.includes(k)) {
      return path;
    }
  }
  return null;
}

export function getModuleImage(name) {
  if (!name) return null;
  const clean = name.replace(/slot \d+:\s*/i, '').replace(/\(.*?\)/g, '').trim();
  const canonicalKey = moduleKey(resolveModuleName(clean));
  const key = MODULE_IMAGE_KEYS[canonicalKey] || canonicalKey;
  const overrides = {
    overdriveunit: '/module-images/overdrive-unit.png',
    heavyarmorkit: '/module-images/heavy-armor-kit.png',
    damagecontroller: '/module-images/damage-controller.png',
    ultimateplatedarmorkit: '/module-images/ultimate-plated-armor-kit.png',
    ultimateantimatterreactor: '/module-images/ultimate-antimatter-reactor.png',
  };
  return imageManifest.modules?.[canonicalKey] || imageManifest.all_files?.[canonicalKey] || overrides[canonicalKey] || imageManifest.modules?.[key] || imageManifest.all_files?.[key] || null;
}

export function getItemImage(name, category = '') {
  if (!name) return null;
  const catLower = category.toLowerCase();
  if (catLower.includes('weapon')) {
    return getWeaponImage(name, category);
  }
  if (catLower.includes('robot') || catLower.includes('titan')) {
    return getRobotImage(name);
  }
  if (catLower.includes('drone')) {
    return getDroneImage(name);
  }
  return getRobotImage(name) || getWeaponImage(name, category) || getDroneImage(name) || getModuleImage(name);
}

export function getSpecializationIcon(name) {
  if (!name) return null;
  const k = cleanKey(name);
  return imageManifest.icons?.[k] || null;
}

const ROLE_ICON_MAP = {
  support: 'support',
  tankbuster: 'tankbuster',
  sniper: 'sniper',
  midrange: 'midranger',
  midranger: 'midranger',
  brawler: 'brawler',
  beaconrunner: 'beaconrunner',
  assassin: 'assassin',
};

export function getRoleIcon(roleName) {
  if (!roleName) return null;
  const k = cleanKey(roleName);
  const targetKey = ROLE_ICON_MAP[k] || k;
  return imageManifest.icons?.[targetKey] || imageManifest.icons?.[k] || null;
}

// Official release metadata refreshes independently of the workbook. Compare
// versions so republishing older notes cannot restore old NEW badges.
export const latestEquipmentUpdate = equipmentUpdates.filter(update => update.version).reduce((latest, update) => (
  !latest || update.version.localeCompare(latest.version, 'en', { numeric: true }) > 0 ? update : latest
), null);

export function isNewTierItem(name, category) {
  if (!name) return false;
  const byCategory = latestEquipmentUpdate?.items || {};
  const newest = category ? byCategory[category] || [] : Object.values(byCategory).flat();
  const { cleanName } = extractTierTags(name);
  const keys = cleanName.split(/[,/.]/).map(getEquipmentKey);
  return newest.some(item => keys.includes(getEquipmentKey(item)));
}
