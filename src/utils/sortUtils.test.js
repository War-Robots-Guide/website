import { describe, it, expect } from 'vitest';
import { sortBySearchQuery } from './sortUtils';

describe('sortBySearchQuery', () => {
  const items = [
    { name: 'Apple' },
    { name: 'Banana' },
    { name: 'Pineapple' },
    { name: 'Appetizer' }
  ];

  const getKey = (item) => item.name;

  it('should not mutate the original array', () => {
    const original = [...items];
    sortBySearchQuery(items, 'apple', getKey);
    expect(items).toEqual(original);
  });

  it('should prioritize exact matches', () => {
    // Both 'Apple' and 'Pineapple' contain 'apple', but 'Apple' is exact.
    const result = sortBySearchQuery(items, 'apple', getKey);
    expect(result[0].name).toBe('Apple');
  });

  it('should prioritize startsWith matches over includes matches', () => {
    // query: 'app'
    // 'Apple' and 'Appetizer' start with 'app'
    // 'Pineapple' includes 'app'
    const result = sortBySearchQuery(items, 'app', getKey);

    // The first two items should be Apple and Appetizer (order between them might not change if they both start with 'app')
    const firstTwo = result.slice(0, 2).map(item => item.name);
    expect(firstTwo).toContain('Apple');
    expect(firstTwo).toContain('Appetizer');

    // Pineapple should come after
    const pineAppleIndex = result.findIndex(item => item.name === 'Pineapple');
    expect(pineAppleIndex).toBeGreaterThanOrEqual(2);
  });

  it('should maintain relative order if neither is a better match', () => {
    // 'a' is in Apple, Banana, Pineapple, Appetizer.
    const result = sortBySearchQuery(items, 'xyz', getKey);
    // None match, order should be preserved
    expect(result).toEqual(items);
  });

  it('should prioritize includes match over no match', () => {
    const result = sortBySearchQuery(items, 'nana', getKey);
    expect(result[0].name).toBe('Banana');
  });
});
