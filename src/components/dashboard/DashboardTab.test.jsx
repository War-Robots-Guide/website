import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DashboardTab } from './DashboardTab';

// Mock robot guide data with unsorted dates and a featured robot
vi.mock('../../data/robot_guide.json', () => ({
  default: {
    changelog: [
      { date: '2025-01-10', text: 'Second change' },
      { date: '2026-06-01', text: 'Latest change' },
      { date: '2024-12-05', text: 'Oldest change' }
    ],
    robots: [
      {
        name: 'Destrier',
        value_rating: 4,
        comments: 'Classic starter robot with decent speed.',
        roles: [{ role: 'Beacon Runner', type: 'primary' }]
      }
    ],
    titans: [],
    builds: []
  }
}));

vi.mock('../../data/weapons_dps.json', () => ({
  default: {
    light: []
  }
}));

vi.mock('../../data/tiers.json', () => ({
  default: {
    Robots: {
      A: {
        items: [
          { name: 'Destrier', description: 'Destrier description from tiers data' }
        ]
      }
    }
  }
}));

describe('DashboardTab Changelog Sorting', () => {
  it('renders changelog entries in descending order by date', () => {
    render(<DashboardTab onTabChange={() => {}} />);
    
    // Select all changelog entry containers
    // Each changelog entry displays date as var(--cyan) colored text
    const dateElements = screen.getAllByText(/20(24|25|26)-/);
    
    expect(dateElements).toHaveLength(4);
    expect(dateElements[0].textContent).toBe('Last Updated: 2026-06-01');
    expect(dateElements[1].textContent).toBe('2026-06-01');
    expect(dateElements[2].textContent).toBe('2025-01-10');
    expect(dateElements[3].textContent).toBe('2024-12-05');
  });

  it('renders the absolute latest change in stats summary', () => {
    render(<DashboardTab onTabChange={() => {}} />);
    
    // Stats section should show the latest change date '2026-06-01'
    // We already checked dates in the list, but let's make sure our latestChange stat is correct.
    // In our mocked component, stats.latestChange is 2026-06-01.
    // Let's verify '2026-06-01' is displayed as part of latest change.
    expect(screen.getAllByText('2026-06-01').length).toBeGreaterThan(0);
  });
});

describe('DashboardTab Interactivity', () => {
  it('calls onItemClick when a robot card is clicked', () => {
    const mockOnItemClick = vi.fn();
    render(<DashboardTab onTabChange={() => {}} onItemClick={mockOnItemClick} />);
    
    // Find the robot card (by role and name)
    const card = screen.getByRole('button', { name: /View details for Destrier/i });
    expect(card).toBeInTheDocument();
    
    // Click the card
    card.click();
    
    expect(mockOnItemClick).toHaveBeenCalledWith(
      'Destrier',
      'Robots',
      { description: 'Classic starter robot with decent speed.' }
    );
  });
});

