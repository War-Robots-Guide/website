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
    describe('attribute ratings (<= 10)', () => {
      it('returns correct colors based on range thresholds', () => {
        expect(getRatingColor(1)).toBe('#mock_red');
        expect(getRatingColor(2)).toBe('#mock_red');
        expect(getRatingColor(3)).toBe('#mock_orange');
        expect(getRatingColor(4)).toBe('#mock_orange');
        expect(getRatingColor(5)).toBe('#mock_yellow');
        expect(getRatingColor(6)).toBe('#mock_yellow');
        expect(getRatingColor(7)).toBe('#mock_lime');
        expect(getRatingColor(8)).toBe('#mock_green');
        expect(getRatingColor(9)).toBe('#mock_blue');
        expect(getRatingColor(10)).toBe('#mock_blue');
      });
    });

    describe('overall ratings (> 10)', () => {
      it('returns correct colors based on range thresholds', () => {
        expect(getRatingColor(12)).toBe('#mock_red');
        expect(getRatingColor(15)).toBe('#mock_red');
        expect(getRatingColor(16)).toBe('#mock_orange');
        expect(getRatingColor(20)).toBe('#mock_orange');
        expect(getRatingColor(21)).toBe('#mock_yellow');
        expect(getRatingColor(25)).toBe('#mock_yellow');
        expect(getRatingColor(26)).toBe('#mock_lime');
        expect(getRatingColor(30)).toBe('#mock_lime');
        expect(getRatingColor(31)).toBe('#mock_green');
        expect(getRatingColor(35)).toBe('#mock_green');
        expect(getRatingColor(36)).toBe('#mock_blue');
        expect(getRatingColor(44)).toBe('#mock_blue');
      });
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
