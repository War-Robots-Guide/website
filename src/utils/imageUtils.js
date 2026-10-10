import imageManifest from '../data/image_manifest.json';

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

export function getRobotImage(name) {
  if (!name) return null;
  const { cleanName } = extractTierTags(name);
  const k = cleanKey(cleanName);

  if (imageManifest.items?.[k]) {
    return imageManifest.items[k];
  }

  // Handle UE / Ultimate prefix
  if (k.startsWith('ue')) {
    const baseK = k.slice(2);
    if (imageManifest.items?.[`ultimate${baseK}`]) {
      return imageManifest.items[`ultimate${baseK}`];
    }
    if (imageManifest.items?.[baseK]) {
      return imageManifest.items[baseK];
    }
  }

  return null;
}

export function getWeaponImage(name, weightClass = '') {
  if (!name) return null;
  const { cleanName } = extractTierTags(name);
  const baseName = cleanName.replace(/\s*\(.*?\)/g, '').trim();
  const k = cleanKey(baseName);

  let suffix = '';
  if (weightClass.includes('Heavy')) suffix = 'h';
  else if (weightClass.includes('Medium')) suffix = 'm';
  else if (weightClass.includes('Light')) suffix = 'l';
  else if (weightClass.includes('Alpha')) suffix = 'a';
  else if (weightClass.includes('Beta')) suffix = 'b';

  if (suffix && imageManifest.weapons?.[`${k}_${suffix}`]) {
    return imageManifest.weapons[`${k}_${suffix}`];
  }

  if (imageManifest.weapons?.[k]) {
    return imageManifest.weapons[k];
  }

  // Check items general
  if (suffix && imageManifest.items?.[`${k}${suffix}`]) {
    return imageManifest.items[`${k}${suffix}`];
  }
  if (imageManifest.items?.[k]) {
    return imageManifest.items[k];
  }

  return null;
}

export function getPilotImage(name) {
  if (!name || name === 'N/A' || name.toLowerCase().includes('weapon pilot')) return null;
  const k = cleanKey(name);
  if (imageManifest.pilots?.[k]) {
    return imageManifest.pilots[k];
  }
  // Search partial matches
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
  const k = cleanKey(clean);
  if (imageManifest.modules?.[k]) {
    return imageManifest.modules[k];
  }
  // Try matching words in name
  for (const [mk, path] of Object.entries(imageManifest.modules || {})) {
    if (k.includes(mk) || mk.includes(k)) {
      return path;
    }
  }
  return null;
}

export function getItemImage(name, category = '') {
  if (!name) return null;
  const catLower = category.toLowerCase();
  if (catLower.includes('robot') || catLower.includes('titan')) {
    return getRobotImage(name);
  }
  if (catLower.includes('weapon')) {
    return getWeaponImage(name, category);
  }
  if (catLower.includes('drone')) {
    return getDroneImage(name);
  }
  // Fallback to checking robot/titan, then weapon, then module
  return getRobotImage(name) || getWeaponImage(name, category) || getDroneImage(name) || getModuleImage(name);
}

export function getSpecializationIcon(name) {
  if (!name) return null;
  const k = cleanKey(name);
  return imageManifest.icons?.[k] || null;
}

export function isNewTierItem(name) {
  if (!name || !imageManifest.new_tier_items?.length) return false;
  const { cleanName } = extractTierTags(name);
  const k = cleanKey(cleanName);
  return imageManifest.new_tier_items.some(item => cleanKey(item) === k);
}
