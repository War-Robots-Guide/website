import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { RobotsGuideTab } from './RobotsGuideTab';

// Mock robot guide data
vi.mock('../../data/robot_guide.json', () => ({
  default: {
    robots: [
      {
        name: 'Ravana',
        sheet: 'Tier 4 Robots',
        value_rating: 4,
        scores: { longevity: 2, lethality: 1, mobility: 1, utility: 2, accessibility: 2, overall: 4 },
        comments: 'Highly recommended brawler robot.',
        roles: [{ role: 'Brawler', type: 'primary', footnote: '' }]
      },
      {
        name: 'Destrier',
        sheet: 'Tier 3 Robots',
        value_rating: 1,
        scores: { longevity: 0, lethality: 0, mobility: 1, utility: 0, accessibility: 3, overall: 1 },
        comments: 'Introductory Ravana-like robot guide.',
        roles: []
      },
      {
        name: 'UE Raven',
        sheet: 'Ultimate Robots',
        value_rating: 30,
        scores: { longevity: 10, lethality: 8, mobility: 10, utility: 2, accessibility: 0, overall: 30 },
        comments: 'UE Raven is completely broken.',
        roles: [{ role: 'Brawler', type: 'primary', footnote: '' }]
      }
    ],
    titans: [
      {
        name: 'Luchador',
        value_rating: 3,
        scores: { longevity: 2, lethality: 2, mobility: 0, utility: 1, accessibility: 1, overall: 3 },
        comments: 'Excellent Luchador comments.'
      }
    ]
  }
}));

describe('RobotsGuideTab Search Prioritization', () => {
  it('renders all robots initially', () => {
    render(<RobotsGuideTab />);
    expect(screen.getByText('Ravana')).toBeInTheDocument();
    expect(screen.getByText('Destrier')).toBeInTheDocument();
  });

  it('filters and prioritizes robot name matches', async () => {
    render(<RobotsGuideTab />);
    const searchInput = screen.getByPlaceholderText('Search robots...');
    
    // Search for 'Ravana' (exact/prefix matches Ravana robot, substring matches Destrier description)
    fireEvent.change(searchInput, { target: { value: 'Ravana' } });
    
    // Wait for the debounce input handler (250ms)
    await waitFor(() => {
      const robotNames = screen.getAllByRole('heading', { level: 3 }).map(h => h.textContent);
      // Wait, there might be other h3 headings like 'Automatic Specialization Picker' but that's in specializations tab.
      // Under robots tab, let's filter to just headers of cards.
      // Let's filter names containing Ravana or Destrier
      const matchedNames = robotNames.filter(name => name === 'Ravana' || name === 'Destrier');
      expect(matchedNames).toHaveLength(2);
      // 'Ravana' exact match should be sorted before 'Destrier' description match
      expect(matchedNames[0]).toBe('Ravana');
      expect(matchedNames[1]).toBe('Destrier');
    });
  });

  it('renders all robots including Ultimate robots in the same place initially', () => {
    render(<RobotsGuideTab />);
    expect(screen.getByText('Ravana')).toBeInTheDocument();
    expect(screen.getByText('Destrier')).toBeInTheDocument();
    expect(screen.getByText('UE Raven')).toBeInTheDocument();
  });

  it('filters by category (All Robot Types / Ultimate Robots)', () => {
    render(<RobotsGuideTab />);
    const categorySelect = screen.getByDisplayValue('All Robot Types');

    // Filter to Ultimate Robots
    fireEvent.change(categorySelect, { target: { value: 'Ultimate Robots' } });
    expect(screen.getByText('UE Raven')).toBeInTheDocument();
    expect(screen.queryByText('Ravana')).not.toBeInTheDocument();
    expect(screen.queryByText('Destrier')).not.toBeInTheDocument();

    // Filter back to All Robot Types
    fireEvent.change(categorySelect, { target: { value: 'All' } });
    expect(screen.getByText('Ravana')).toBeInTheDocument();
    expect(screen.getByText('UE Raven')).toBeInTheDocument();
  });

  it('renders Ultimate badge on Ultimate robot cards', () => {
    render(<RobotsGuideTab />);
    const ultimateBadges = screen.getAllByText('Ultimate');
    expect(ultimateBadges.length).toBeGreaterThanOrEqual(1);
  });

  it('filters robots by subsectioned Value Rating range', () => {
    render(<RobotsGuideTab />);
    const valueRatingSelect = screen.getByDisplayValue('All Value Ratings');

    // Filter to 30 - 40 (UE Raven has value_rating: 30)
    fireEvent.change(valueRatingSelect, { target: { value: '30-40' } });
    expect(screen.getByText('UE Raven')).toBeInTheDocument();
    expect(screen.queryByText('Ravana')).not.toBeInTheDocument();
    expect(screen.queryByText('Destrier')).not.toBeInTheDocument();

    // Filter to 0 - 10 (Ravana has 4, Destrier has 1)
    fireEvent.change(valueRatingSelect, { target: { value: '0-10' } });
    expect(screen.getByText('Ravana')).toBeInTheDocument();
    expect(screen.getByText('Destrier')).toBeInTheDocument();
    expect(screen.queryByText('UE Raven')).not.toBeInTheDocument();
  });

  it('sorts robots by Value Rating when selected', () => {
    render(<RobotsGuideTab />);
    const sortSelect = screen.getByDisplayValue('Default Sort (by Tier)');

    fireEvent.change(sortSelect, { target: { value: 'value_rating' } });

    // In mock data: UE Raven has 30, Ravana has 4, Destrier has 1
    const robotHeadings = screen.getAllByRole('heading', { level: 3 }).map(h => h.textContent);
    const matchedNames = robotHeadings.filter(name => ['Ravana', 'Destrier', 'UE Raven'].includes(name));
    expect(matchedNames[0]).toBe('UE Raven');
    expect(matchedNames[1]).toBe('Ravana');
    expect(matchedNames[2]).toBe('Destrier');
  });
});
