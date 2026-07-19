import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { RatingBar } from './RatingBar';

describe('RatingBar Component', () => {
  describe('default unitType (robot)', () => {
    it('renders correctly with a standard positive rating', () => {
      const { container } = render(<RatingBar rating={28} />);

      // Should show the correct label for rating 28 (Fair)
      expect(screen.getByText('Fair (28)')).toBeInTheDocument();

      // Calculate expected percentage: ((28 - 0) / (35 - 0)) * 100 = 80%
      const markerElement = container.querySelector('div[style*="position: absolute"]');
      expect(markerElement).toHaveStyle({ left: '80%' });
    });

    it('renders correctly with a negative/low rating', () => {
      const { container } = render(<RatingBar rating={7} />);

      expect(screen.getByText('Horrible (7)')).toBeInTheDocument();

      // Calculate expected percentage: ((7 - 0) / (35 - 0)) * 100 = 20%
      const markerElement = container.querySelector('div[style*="position: absolute"]');
      expect(markerElement).toHaveStyle({ left: '20%' });
    });

    it('clamps rating to upper bound visually but shows dynamic label', () => {
      const { container } = render(<RatingBar rating={44} />);

      expect(screen.getByText('Excellent (44)')).toBeInTheDocument();

      // Calculate expected percentage: 100 + (44 - 35) * 1.2 = 110.8% visual overflow
      const markerElement = container.querySelector('div[style*="position: absolute"]');
      expect(markerElement).toHaveStyle({ left: '110.8%' });
    });

    it('clamps rating to lower bound visually but shows dynamic label', () => {
      const { container } = render(<RatingBar rating={-5} />);

      expect(screen.getByText('Horrible (-5)')).toBeInTheDocument();

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
      expect(markerElement).toHaveStyle({ left: '80%' });
    });

    it('clamps rating to upper bound visually but shows dynamic label', () => {
      const { container } = render(<RatingBar rating={44} unitType="titan" />);

      expect(screen.getByText('Excellent (44)')).toBeInTheDocument();

      const markerElement = container.querySelector('div[style*="position: absolute"]');
      expect(markerElement).toHaveStyle({ left: '110.8%' });
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
