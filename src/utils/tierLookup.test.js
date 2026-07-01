import { describe, it, expect, vi } from 'vitest';

// Mock the static tiers data before the module under test is imported.
vi.mock('../data/tiers.json', () => {
  return {
    default: {
      Robots: {
        X: {
          items: [
            { name: "Ares", description: "Ares Description" },
            { name: "UE Ares", description: "UE Ares Description" },
            // Asterisk edge case
            { name: "Phantom***", description: "Phantom Description" }
          ]
        },
        S: {
          items: [
            // Used for substring matching (cleanName includes cachedItem)
            { name: "Thunder", description: "Thunder Description" },
            // Used for substring matching (cachedItem includes cleanName)
            { name: "Thunderbolt", description: "Thunderbolt Description" }
          ]
        },
        A: {
          items: [
            // Multiple names in one string
            { name: "Bot1, Bot2", description: "Multi-bot Description" },
            { name: "Short", description: "Short Description" },
            { name: "UE Short", description: "UE Short Description" }
          ]
        },
        B: {
          items: [
            { name: "", description: "No Name Description" }
          ]
        },
        C: {
          // No items array
        }
      }
    }
  };
});

import { getTierForName, getDescriptionForName, getFootnoteText } from './tierLookup';

describe('tierLookup', () => {
  describe('getDescriptionForName', () => {
    it('should return empty string for invalid inputs', () => {
      expect(getDescriptionForName(null, 'Robots')).toBe('');
      expect(getDescriptionForName(undefined, 'Robots')).toBe('');
      expect(getDescriptionForName('', 'Robots')).toBe('');
      expect(getDescriptionForName('Ares', 'InvalidCategory')).toBe('');
    });

    it('should match exact name (fast path)', () => {
      expect(getDescriptionForName('Ares', 'Robots')).toBe('Ares Description');
    });

    it('should match exact name with trailing asterisks in input or cache', () => {
      // Input has asterisks but cache doesn't (cache has "Ares", input is "Ares**")
      expect(getDescriptionForName('Ares**', 'Robots')).toBe('Ares Description');
      // Cache has asterisks ("Phantom***") and input doesn't ("Phantom")
      expect(getDescriptionForName('Phantom', 'Robots')).toBe('Phantom Description');
      // Both have asterisks
      expect(getDescriptionForName('Phantom*', 'Robots')).toBe('Phantom Description');
    });

    it('should match via fallback if provided name includes cached item name', () => {
      // Input "Thunder strike" includes "Thunder" (cached)
      expect(getDescriptionForName('Thunder strike', 'Robots')).toBe('Thunder Description');
    });

    it('should match via fallback if cached item name includes provided name', () => {
      // Cached "Thunderbolt" includes "Underbolt"
      expect(getDescriptionForName('Underbolt', 'Robots')).toBe('Thunderbolt Description');
    });

    it('should respect UE vs non-UE boundaries in fallback (isUe mismatch)', () => {
      // "UE Ares" should NOT fallback to "Ares" if UE flag mismatches, but here "UE Ares" is an exact match.
      expect(getDescriptionForName('UE Ares', 'Robots')).toBe('UE Ares Description');

      // Test fallback where UE flag MUST match.
      // "UE Short Circuit" has isUe=true, cleanName="ue short circuit".
      // It includes "short" (which is non-UE) and "ue short" (which is UE).
      // It should match the "UE Short" cached item, not the "Short" cached item.
      expect(getDescriptionForName('UE Short Circuit', 'Robots')).toBe('UE Short Description');

      // Conversely, "Short Circuit" has isUe=false. It includes "short".
      // It should match "Short Description", NOT "UE Short Description" even though "short" is in "ue short".
      expect(getDescriptionForName('Short Circuit', 'Robots')).toBe('Short Description');
    });

    it('should handle multiple comma-separated names in cache', () => {
      expect(getDescriptionForName('Bot1', 'Robots')).toBe('Multi-bot Description');
      expect(getDescriptionForName('Bot2', 'Robots')).toBe('Multi-bot Description');
    });

    it('should return empty string if no match is found (fallback case)', () => {
      expect(getDescriptionForName('NonExistentBot', 'Robots')).toBe('');
    });
  });

  describe('getTierForName', () => {
    it('should return null for invalid inputs', () => {
      expect(getTierForName(null, 'Robots')).toBeNull();
      expect(getTierForName(undefined, 'Robots')).toBeNull();
      expect(getTierForName('', 'Robots')).toBeNull();
      expect(getTierForName('Ares', 'InvalidCategory')).toBeNull();
    });

    it('should return correct tier letter for exact match', () => {
      expect(getTierForName('Ares', 'Robots')).toBe('X');
      expect(getTierForName('Thunder', 'Robots')).toBe('S');
    });

    it('should return correct tier letter for comma-separated items', () => {
      expect(getTierForName('Bot1', 'Robots')).toBe('A');
      expect(getTierForName('Bot2', 'Robots')).toBe('A');
    });

    it('should return null if not found', () => {
      expect(getTierForName('NonExistentBot', 'Robots')).toBeNull();
    });
  });

  describe('getFootnoteText', () => {
    const mockFootnotes = [
      "*Only with Traditionalist pilot skill",
      "**Only with Freezo drone",
      "***Only with Lock-down Ammo module"
    ];

    it('should return empty string for invalid inputs', () => {
      expect(getFootnoteText(null, mockFootnotes)).toBe('');
      expect(getFootnoteText(undefined, mockFootnotes)).toBe('');
      expect(getFootnoteText('*', null)).toBe('*');
    });

    it('should match asterisk strings correctly', () => {
      expect(getFootnoteText('*', mockFootnotes)).toBe('*Only with Traditionalist pilot skill');
      expect(getFootnoteText('**', mockFootnotes)).toBe('**Only with Freezo drone');
      expect(getFootnoteText('***', mockFootnotes)).toBe('***Only with Lock-down Ammo module');
    });

    it('should match numeric indices correctly', () => {
      expect(getFootnoteText('1', mockFootnotes)).toBe('*Only with Traditionalist pilot skill');
      expect(getFootnoteText('2', mockFootnotes)).toBe('**Only with Freezo drone');
    });

    it('should fallback to returning the key if not found in list', () => {
      expect(getFootnoteText('****', mockFootnotes)).toBe('****');
      expect(getFootnoteText('4', mockFootnotes)).toBe('4');
    });
  });
});
