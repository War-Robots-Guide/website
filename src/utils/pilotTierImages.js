import imageManifest from '../data/image_manifest.json';

// These aliases identify the same named pilot; numbered variants remain distinct.
const aliases = {
  redactedtwins: 'twins',
  saticatfelidae: 'satifelidae',
  moniquelenorman: 'moniquelenormands',
  victoriab: 'victoria',
};

export function getPilotTierImage(name) {
  if (!name) return null;
  const key = name.normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^a-z0-9]/g, '');
  return imageManifest.pilots?.[key] || imageManifest.pilots?.[aliases[key]] || null;
}
