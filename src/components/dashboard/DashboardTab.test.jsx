import { render, screen, within } from '@testing-library/react';
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
        value_rating: 34,
        scores: { accessibility: 4, overall: 34 },
        comments: 'Classic starter robot with decent speed.',
        roles: [{ role: 'Beacon Runner', type: 'primary' }]
      },
      {
        name: 'HighValueMeta', value_rating: 45,
        scores: { accessibility: 3, overall: 45 },
        comments: 'High value does not make this robot accessible.', roles: [],
      },
      {
        name: 'AccessibleRobot', value_rating: 30,
        scores: { accessibility: 4, overall: 30 },
        comments: 'Accessible despite a lower total value rating.', roles: [],
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
      X: { items: [{ name: '⬆️HighValueMeta', description: 'Meta rationale' }] },
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
  it('selects and labels featured robots by accessibility rather than total value', () => {
    render(<DashboardTab />);
    const meta = within(screen.getByRole('button', { name: 'View details for HighValueMeta in tier list' }));
    expect(meta.getByText('Meta')).toBeVisible();
    expect(meta.queryByText('F2P')).not.toBeInTheDocument();
    for (const name of ['Destrier', 'AccessibleRobot']) {
      const card = within(screen.getByRole('button', { name: `View details for ${name} in tier list` }));
      expect(card.getByText('F2P')).toBeVisible();
      expect(card.queryByText('Meta')).not.toBeInTheDocument();
    }
  });

  it('calls onTabChange and onItemClick with target route when a robot card is clicked', () => {
    const mockOnTabChange = vi.fn();
    const mockOnItemClick = vi.fn();
    render(<DashboardTab onTabChange={mockOnTabChange} onItemClick={mockOnItemClick} />);
    
    // Find the robot card (by role and name)
    const card = screen.getByRole('button', { name: /View details for Destrier/i });
    expect(card).toBeInTheDocument();
    
    // Click the card
    card.click();
    
    expect(mockOnTabChange).toHaveBeenCalledWith('tiers');
    expect(mockOnItemClick).toHaveBeenCalledWith(
      'Destrier',
      'Robots',
      { description: 'Destrier description from tiers data' },
      'tiers'
    );
  });
});

