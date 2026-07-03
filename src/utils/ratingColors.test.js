import { describe, it, expect, vi } from 'vitest';

// Mock the imported JSON data before importing the module under test
vi.mock('../data/robot_guide.json', () => ({
  default: {
    rating_colors: {
      "<= -2": "#mock_red",
      "-1": "#mock_orange",
      "0": "#mock_yellow",
      "+1": "#mock_lime",
      "+2": "#mock_green",
      ">= +3": "#mock_blue"
    }
  }
}));

import { getRatingColor, getRatingColorsList } from './ratingColors';

describe('ratingColors utility', () => {
  describe('getRatingColor', () => {
    it('returns the <= -2 color for values <= -1.5', () => {
      expect(getRatingColor(-2)).toBe('#mock_red');
      expect(getRatingColor(-1.5)).toBe('#mock_red');
      expect(getRatingColor(-5)).toBe('#mock_red');
    });

    it('returns the -1 color for values <= -0.5 and > -1.5', () => {
      expect(getRatingColor(-1.4)).toBe('#mock_orange');
      expect(getRatingColor(-1)).toBe('#mock_orange');
      expect(getRatingColor(-0.5)).toBe('#mock_orange');
    });

    it('returns the 0 color for values <= 0.5 and > -0.5', () => {
      expect(getRatingColor(-0.4)).toBe('#mock_yellow');
      expect(getRatingColor(0)).toBe('#mock_yellow');
      expect(getRatingColor(0.5)).toBe('#mock_yellow');
    });

    it('returns the +1 color for values <= 1.5 and > 0.5', () => {
      expect(getRatingColor(0.6)).toBe('#mock_lime');
      expect(getRatingColor(1)).toBe('#mock_lime');
      expect(getRatingColor(1.5)).toBe('#mock_lime');
    });

    it('returns the +2 color for values <= 2.5 and > 1.5', () => {
      expect(getRatingColor(1.6)).toBe('#mock_green');
      expect(getRatingColor(2)).toBe('#mock_green');
      expect(getRatingColor(2.5)).toBe('#mock_green');
    });

    it('returns the >= +3 color for values > 2.5', () => {
      expect(getRatingColor(2.6)).toBe('#mock_blue');
      expect(getRatingColor(3)).toBe('#mock_blue');
      expect(getRatingColor(10)).toBe('#mock_blue');
    });
  });

  describe('getRatingColorsList', () => {
    it('returns the list of colors in the expected order', () => {
      const expectedList = [
        '#mock_red',
        '#mock_orange',
        '#mock_yellow',
        '#mock_lime',
        '#mock_green',
        '#mock_blue'
      ];
      expect(getRatingColorsList()).toEqual(expectedList);
    });
  });
});
