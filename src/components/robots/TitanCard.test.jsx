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

  it('renders Overall Score bar scaled out of 50', () => {
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

    const { container } = render(<TitanCard titan={mockTitan} onClick={vi.fn()} />);

    // overall score is 30, so out of 50 it should be (30/50)*100 = 60%
    const scoreWrappers = container.querySelectorAll('.score-bar-wrapper');
    const overallWrapper = Array.from(scoreWrappers).find(w => w.textContent.includes('Overall Score'));
    expect(overallWrapper).toBeDefined();

    const fillElement = overallWrapper.querySelector('.score-fill');
    expect(fillElement).toHaveStyle({ width: '60%' });
  });
});
