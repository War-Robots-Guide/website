import tiersData from '../data/tiers.json';

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
            const names = item.name.split(',').map(n => n.trim().toLowerCase());
            for (const n of names) {
              tierLookupCache[category].set(n, {
                tierLetter: tierLetter,
                // Store description for DashboardTab
                description: item.description,
                // Clean name for DashboardTab iteration fallback
                cleanName: n.replace(/\*+$/, '').trim(),
                isUe: n.replace(/\*+$/, '').trim().startsWith('ue '),
                originalName: item.name
              });
            }

            // Also store the exact cleaned name from DashboardTab logic
            const tClean = item.name.replace(/\*+$/, '').trim().toLowerCase();
            if (!tierLookupCache[category].has(tClean)) {
               tierLookupCache[category].set(tClean, {
                tierLetter: tierLetter,
                description: item.description,
                cleanName: tClean,
                isUe: tClean.startsWith('ue '),
                originalName: item.name
              });
            }
          }
        }
      }
    }
  }
}

export const getTierForName = (name, category) => {
  if (!name || !tierLookupCache[category]) return null;
  const match = tierLookupCache[category].get(name.toLowerCase());
  return match ? match.tierLetter : null;
};

export const getDescriptionForName = (name, category) => {
  if (!name || !tierLookupCache[category]) return '';

  const cleanName = name.replace(/\*+$/, '').trim().toLowerCase();
  const isUe = cleanName.startsWith('ue ');
  const cache = tierLookupCache[category];

  // Fast path: exact match
  const exactMatch = cache.get(cleanName);
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
