import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TitanCard } from './TitanCard';

describe('TitanCard', () => {
  it('renders Ultimate badge and class for UE prefix', () => {
    const mockTitan = {
      name: 'UE Colossus',
      sheet: 'Titans',
      value_rating: 5,
      comments: 'A massive UE titan.',
      scores: {
        longevity: 3,
        lethality: 4,
        mobility: 2,
        utility: 3,
        accessibility: 1,
        overall: 3
      },
      roles: []
    };

    render(<TitanCard titan={mockTitan} onClick={vi.fn()} />);

    // Ultimate badge
    expect(screen.getByText('Ultimate')).toBeInTheDocument();

    // Root element should include the ultimate class
    const card = screen.getByRole('button', { name: `View details for UE Colossus` });
    expect(card).toHaveClass('ultimate-robot-card');
  });

  it('renders Titan name and value rating correctly', () => {
    const mockTitan = {
      name: 'Luchador',
      sheet: 'Titans',
      value_rating: 30,
      comments: 'Test',
      scores: {
        longevity: 8,
        lethality: 6,
        mobility: 5,
        utility: 5,
        accessibility: 6,
        overall: 30
      },
      roles: []
    };

    render(<TitanCard titan={mockTitan} onClick={vi.fn()} />);

    expect(screen.getByText('Luchador')).toBeInTheDocument();
    expect(screen.getByText('VALUE RATING')).toBeInTheDocument();
    expect(screen.getByText(/30/)).toBeInTheDocument();
  });
});
