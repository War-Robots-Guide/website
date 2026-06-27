export function sortBySearchQuery(items, query, keyGetter) {
  return [...items].sort((a, b) => {
    const aValue = keyGetter(a).toLowerCase();
    const bValue = keyGetter(b).toLowerCase();

    const aExact = aValue === query;
    const bExact = bValue === query;
    if (aExact && !bExact) return -1;
    if (!aExact && bExact) return 1;

    const aStarts = aValue.startsWith(query);
    const bStarts = bValue.startsWith(query);
    if (aStarts && !bStarts) return -1;
    if (!aStarts && bStarts) return 1;

    const aIncludes = aValue.includes(query);
    const bIncludes = bValue.includes(query);
    if (aIncludes && !bIncludes) return -1;
    if (!aIncludes && bIncludes) return 1;

    return 0;
  });
}
