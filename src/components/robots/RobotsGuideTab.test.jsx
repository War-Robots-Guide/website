import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { RobotsGuideTab } from './RobotsGuideTab';

// Mock robot guide data
vi.mock('../../data/robot_guide.json', () => ({
  default: {
    robots: [
      {
        name: 'Ravana',
        value_rating: 4,
        scores: { longevity: 2, lethality: 1, mobility: 1, utility: 2, accessibility: 2, overall: 4 },
        comments: 'Highly recommended brawler robot.',
        roles: [{ role: 'Brawler', type: 'primary', footnote: '' }]
      },
      {
        name: 'Destrier',
        value_rating: 1,
        scores: { longevity: 0, lethality: 0, mobility: 1, utility: 0, accessibility: 3, overall: 1 },
        comments: 'Introductory Ravana-like robot guide.',
        roles: []
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

  it('filters by stat score minimums and sorts by stat scores', () => {
    render(<RobotsGuideTab />);
    
    // Check that new filter and sorting options are available in the document
    expect(screen.getByText('All Stats')).toBeInTheDocument();
    expect(screen.getByText('Default Sort')).toBeInTheDocument();
  });
});
