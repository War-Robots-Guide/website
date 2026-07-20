import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { RatingBar } from './RatingBar';

describe('RatingBar Component', () => {
  describe('default unitType (robot)', () => {
    it('renders correctly with a standard positive rating', () => {
      const { container } = render(<RatingBar rating={28} />);

      // Should show the correct label for rating 28 (Fair)
      expect(screen.getByText('Fair (28)')).toBeInTheDocument();

      // Calculate expected percentage: ((28 - 12) / (44 - 12)) * 100 = 50%
      const markerElement = container.querySelector('div[style*="position: absolute"]');
      expect(markerElement).toHaveStyle({ left: '50%' });
    });

    it('renders correctly with a negative/low rating', () => {
      const { container } = render(<RatingBar rating={7} />);

      expect(screen.getByText('Bad (7)')).toBeInTheDocument();

      // Calculate expected percentage (clamped to minVal 15): 0%
      const markerElement = container.querySelector('div[style*="position: absolute"]');
      expect(markerElement).toHaveStyle({ left: '0%' });
    });

    it('clamps rating to upper bound visually but shows dynamic label', () => {
      const { container } = render(<RatingBar rating={44} />);

      expect(screen.getByText('Best (44)')).toBeInTheDocument();

      // Calculate expected percentage: ((44 - 12) / (44 - 12)) * 100 = 100%
      const markerElement = container.querySelector('div[style*="position: absolute"]');
      expect(markerElement).toHaveStyle({ left: '100%' });
    });

    it('clamps rating to lower bound visually but shows dynamic label', () => {
      const { container } = render(<RatingBar rating={-5} />);

      expect(screen.getByText('Bad (-5)')).toBeInTheDocument();

      // Calculate expected percentage capped at 0: ((0 - 0) / (35 - 0)) * 100 = 0%
      const markerElement = container.querySelector('div[style*="position: absolute"]');
      expect(markerElement).toHaveStyle({ left: '0%' });
    });
  });

  describe('unitType "titan"', () => {
    it('renders correctly with a standard positive rating', () => {
      const { container } = render(<RatingBar rating={28} unitType="titan" />);

      expect(screen.getByText('Fair (28)')).toBeInTheDocument();

      const markerElement = container.querySelector('div[style*="position: absolute"]');
      expect(markerElement).toHaveStyle({ left: '50%' });
    });

    it('clamps rating to upper bound visually but shows dynamic label', () => {
      const { container } = render(<RatingBar rating={44} unitType="titan" />);

      expect(screen.getByText('Best (44)')).toBeInTheDocument();

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
