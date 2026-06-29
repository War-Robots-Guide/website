import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { RatingBar } from './RatingBar';

describe('RatingBar Component', () => {
  describe('default unitType (robot)', () => {
    it('renders correctly with a standard positive rating', () => {
      const { container } = render(<RatingBar rating={2} />);

      // Should show the correct label for rating 2
      expect(screen.getByText('Good (+2)')).toBeInTheDocument();

      // Calculate expected percentage: ((2 - -2) / (3 - -2)) * 100 = 80%
      const markerElement = container.querySelector('div[style*="position: absolute"]');
      expect(markerElement).toHaveStyle({ left: '80%' });
    });

    it('renders correctly with a negative rating', () => {
      const { container } = render(<RatingBar rating={-1} />);

      expect(screen.getByText('Bad (-1)')).toBeInTheDocument();

      // Calculate expected percentage: ((-1 - -2) / (3 - -2)) * 100 = 20%
      const markerElement = container.querySelector('div[style*="position: absolute"]');
      expect(markerElement).toHaveStyle({ left: '20%' });
    });

    it('clamps rating to upper bound visually but shows dynamic label', () => {
      const { container } = render(<RatingBar rating={10} />);

      // Upper bounds are dynamic now in label
      expect(screen.getByText('Best (+10)')).toBeInTheDocument();

      // Calculate expected percentage capped at 3: ((3 - -2) / (3 - -2)) * 100 = 100%
      const markerElement = container.querySelector('div[style*="position: absolute"]');
      expect(markerElement).toHaveStyle({ left: '100%' });
    });

    it('clamps rating to lower bound visually but shows dynamic label', () => {
      const { container } = render(<RatingBar rating={-5} />);

      // Lower bounds are dynamic now in label
      expect(screen.getByText('Horrible (-5)')).toBeInTheDocument();

      // Calculate expected percentage capped at -2: ((-2 - -2) / (3 - -2)) * 100 = 0%
      const markerElement = container.querySelector('div[style*="position: absolute"]');
      expect(markerElement).toHaveStyle({ left: '0%' });
    });
  });

  describe('unitType "titan"', () => {
    it('renders correctly with a standard positive rating', () => {
      const { container } = render(<RatingBar rating={2} unitType="titan" />);

      // For titan, rating 2 is "Very Good (+2)"
      expect(screen.getByText('Very Good (+2)')).toBeInTheDocument();

      // Calculate expected percentage: ((2 - -2) / (3 - -2)) * 100 = (4 / 5) * 100 = 80%
      const markerElement = container.querySelector('div[style*="position: absolute"]');
      expect(markerElement).toHaveStyle({ left: '80%' });
    });

    it('clamps rating to upper bound visually but shows dynamic label', () => {
      const { container } = render(<RatingBar rating={5} unitType="titan" />);

      // Upper bound shows actual value
      expect(screen.getByText('Best (+5)')).toBeInTheDocument();

      // Calculate expected percentage: ((3 - -2) / (3 - -2)) * 100 = 100%
      const markerElement = container.querySelector('div[style*="position: absolute"]');
      expect(markerElement).toHaveStyle({ left: '100%' });
    });
  });

  describe('alignment', () => {
    it('applies default left alignment', () => {
      const { container } = render(<RatingBar rating={0} />);

      const rootDiv = container.firstChild;
      expect(rootDiv).toHaveStyle({ marginLeft: '0' });
    });

    it('applies right alignment when specified', () => {
      const { container } = render(<RatingBar rating={0} align="right" />);

      const rootDiv = container.firstChild;
      expect(rootDiv).toHaveStyle({ marginLeft: 'auto' });
    });
  });
});
