import tiersData from '../data/tiers.json';

// Helper to strip tier list emoji tags and trailing asterisks
export const stripTagsAndAsterisks = (name) => {
  if (!name) return '';
  return name
    .replace(/^\[?(?:👥|‼️|⬆️?|⬇️?|👁️?)\]?\s*/u, '')
    .replace(/\*+$/, '')
    .trim();
};

// Build a lookup cache once since tiersData is static
export const tierLookupCache = {};

if (tiersData) {
  for (const [category, catData] of Object.entries(tiersData)) {
    tierLookupCache[category] = new Map();
    for (const [tierLetter, tierObj] of Object.entries(catData)) {
      if (tierObj.items) {
        for (const item of tierObj.items) {
          if (item.name) {
            // For HangarAnalyzerTab: it splits by comma
            const rawNames = item.name.split(',').map(n => n.trim().toLowerCase());
            for (const n of rawNames) {
              const cleanN = stripTagsAndAsterisks(n).toLowerCase();
              const entry = {
                tierLetter: tierLetter,
                // Store description for DashboardTab
                description: item.description,
                // Clean name for DashboardTab iteration fallback
                cleanName: cleanN,
                isUe: cleanN.startsWith('ue '),
                originalName: item.name
              };
              tierLookupCache[category].set(n, entry);
              if (!tierLookupCache[category].has(cleanN)) {
                tierLookupCache[category].set(cleanN, entry);
              }
            }

            // Also store the exact cleaned name from DashboardTab logic
            const tRaw = item.name.trim().toLowerCase();
            const tClean = stripTagsAndAsterisks(item.name).toLowerCase();
            const mainEntry = {
              tierLetter: tierLetter,
              description: item.description,
              cleanName: tClean,
              isUe: tClean.startsWith('ue '),
              originalName: item.name
            };
            if (!tierLookupCache[category].has(tRaw)) {
              tierLookupCache[category].set(tRaw, mainEntry);
            }
            if (!tierLookupCache[category].has(tClean)) {
              tierLookupCache[category].set(tClean, mainEntry);
            }
          }
        }
      }
    }
  }
}

export const getTierForName = (name, category) => {
  if (!name || !tierLookupCache[category]) return null;
  const raw = name.trim().toLowerCase();
  const match = tierLookupCache[category].get(raw);
  if (match) return match.tierLetter;

  const clean = stripTagsAndAsterisks(name).toLowerCase();
  const cleanMatch = tierLookupCache[category].get(clean);
  if (cleanMatch) return cleanMatch.tierLetter;

  // Check alias without 'unit' (e.g. 'ue sword unit' -> 'ue sword')
  const alias = clean.replace(/\s+unit$/, '');
  const aliasMatch = tierLookupCache[category].get(alias);
  if (aliasMatch) return aliasMatch.tierLetter;

  return null;
};

export const getDescriptionForName = (name, category) => {
  if (!name || !tierLookupCache[category]) return '';

  const cleanName = stripTagsAndAsterisks(name).toLowerCase();
  const isUe = cleanName.startsWith('ue ');
  const cache = tierLookupCache[category];

  // Fast path: exact match on raw or clean name
  const raw = name.trim().toLowerCase();
  const exactMatch = cache.get(raw) || cache.get(cleanName);
  if (exactMatch && exactMatch.isUe === isUe) {
    return exactMatch.description;
  }

  // Fallback: includes check
  for (const cachedItem of cache.values()) {
    if (isUe !== cachedItem.isUe) continue;
    if (cleanName.includes(cachedItem.cleanName) || cachedItem.cleanName.includes(cleanName)) {
      return cachedItem.description;
    }
  }

  return '';
};

export const getFootnoteText = (footnote, footnotesData) => {
  if (!footnote) return '';
  if (!footnotesData) return footnote;
  if (/^\d+$/.test(footnote)) {
    const idx = parseInt(footnote, 10) - 1;
    return footnotesData[idx] || footnote;
  }
  return footnotesData.find(f => {
    const prefix = f.match(/^\*+/)?.[0] || '';
    return prefix === footnote;
  }) || footnote;
};
