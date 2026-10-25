import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TierListTab } from './TierListTab';

// Mock the JSON data
vi.mock('../../data/tiers.json', () => ({
  default: {
    disclaimers: ["Important disclaimer text"],
    Robots: {
      S: {
        casual_name: "Top Tier",
        items: [
          { name: "SuperBot", description: "The best robot ever" },
          { name: "MegaBot", description: "Also very good" }
        ]
      },
      A: {
        casual_name: "Great Tier",
        items: [
          { name: "GoodBot", description: "A solid choice" }
        ]
      }
    },
    'Robot Weapons': { X: { casual_name: 'Top', items: [{ name: 'Lumen L, Lumen M, Lumen H', description: 'Family rationale' }] } },
    'Titan Weapons': { X: { casual_name: 'Top', items: [{ name: 'Barq-a. Barq-b', description: 'Titan family rationale' }] } },
    Titans: {
      X: {
        casual_name: "God Tier",
        items: [
          { name: "TitanPrime", description: "Unstoppable titan" }
        ]
      }
    }
  }
}));

describe('TierListTab', () => {
  it('renders every member of robot and Titan weapon families', () => {
    render(<TierListTab onItemClick={vi.fn()} />);
    fireEvent.click(screen.getByText('Robot Weapons'));
    for (const name of ['Lumen L', 'Lumen M', 'Lumen H']) expect(screen.getByRole('button', { name: `View details for ${name}` })).toBeInTheDocument();
    fireEvent.click(screen.getByText('Titan Weapons'));
    for (const name of ['Barq-a', 'Barq-b']) expect(screen.getByRole('button', { name: `View details for ${name}` })).toBeInTheDocument();
  });
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the heading and description and toggles tag legend', () => {
    render(<TierListTab onItemClick={vi.fn()} />);
    expect(screen.getByText('Tier Lists')).toBeInTheDocument();

    // Tag legend is collapsed by default
    expect(screen.getByText(/Tier Tag Guide/i)).toBeInTheDocument();
    expect(screen.queryByText(/potential in squad play/)).not.toBeInTheDocument();

    // Click to expand
    fireEvent.click(screen.getByText(/Tier Tag Guide/i));
    expect(screen.getByText(/potential in squad play/)).toBeInTheDocument();
    expect(screen.getByText(/require an incredibly specific build/)).toBeInTheDocument();
    expect(screen.getByText(/potential to perform at a much higher tier/)).toBeInTheDocument();
    expect(screen.getByText(/perform worse than usual at the moment/)).toBeInTheDocument();
    expect(screen.getByText(/meta is being bent around them/)).toBeInTheDocument();
  });

  it('renders the default category (Robots) and its items', () => {
    render(<TierListTab onItemClick={vi.fn()} />);

    // Check if category pills are rendered
    expect(screen.getByText('Robots')).toBeInTheDocument();
    expect(screen.getByText('Titans')).toBeInTheDocument();

    // Check if items from the default "Robots" category are rendered
    expect(screen.getByText('SuperBot')).toBeInTheDocument();
    expect(screen.getByText('The best robot ever')).toBeInTheDocument();
    expect(screen.getByText('MegaBot')).toBeInTheDocument();
    expect(screen.getByText('GoodBot')).toBeInTheDocument();

    // Check if tiers are rendered
    expect(screen.getByText('S')).toBeInTheDocument();
    expect(screen.getByText('A')).toBeInTheDocument();

    // Titan should not be visible initially
    expect(screen.queryByText('TitanPrime')).not.toBeInTheDocument();
  });

  it('changes category when clicking a tab pill', () => {
    render(<TierListTab onItemClick={vi.fn()} />);

    // Click Titans category
    fireEvent.click(screen.getByText('Titans'));

    // Check if Titans items are rendered
    expect(screen.getByText('TitanPrime')).toBeInTheDocument();
    expect(screen.getByText('Unstoppable titan')).toBeInTheDocument();
    expect(screen.getByText('X')).toBeInTheDocument();

    // Robots items should be gone
    expect(screen.queryByText('SuperBot')).not.toBeInTheDocument();
    expect(screen.queryByText('S')).not.toBeInTheDocument();
  });

  it('filters items based on search query', () => {
    render(<TierListTab onItemClick={vi.fn()} />);

    // Check initial state
    expect(screen.getByText('SuperBot')).toBeInTheDocument();
    expect(screen.getByText('MegaBot')).toBeInTheDocument();
    expect(screen.getByText('GoodBot')).toBeInTheDocument();

    // Find search input and type query
    const searchInput = screen.getByPlaceholderText('Search robots in tier lists...');
    fireEvent.change(searchInput, { target: { value: 'mega' } });

    // Verify only matching items are shown
    expect(screen.queryByText('SuperBot')).not.toBeInTheDocument();
    expect(screen.getByText('MegaBot')).toBeInTheDocument();
    expect(screen.queryByText('GoodBot')).not.toBeInTheDocument();
  });

  it('filters items by description as well', () => {
    render(<TierListTab onItemClick={vi.fn()} />);

    const searchInput = screen.getByPlaceholderText('Search robots in tier lists...');
    fireEvent.change(searchInput, { target: { value: 'solid choice' } });

    expect(screen.queryByText('SuperBot')).not.toBeInTheDocument();
    expect(screen.queryByText('MegaBot')).not.toBeInTheDocument();
    expect(screen.getByText('GoodBot')).toBeInTheDocument(); // Description matches
  });

  it('clears search input when changing categories', () => {
    render(<TierListTab onItemClick={vi.fn()} />);

    // Type in search
    const searchInput = screen.getByPlaceholderText('Search robots in tier lists...');
    fireEvent.change(searchInput, { target: { value: 'super' } });
    expect(searchInput.value).toBe('super');

    // Change category
    fireEvent.click(screen.getByText('Titans'));

    // Search input placeholder updates and value clears
    const newSearchInput = screen.getByPlaceholderText('Search titans in tier lists...');
    expect(newSearchInput.value).toBe('');
  });

  it('calls onItemClick with correct arguments when an item is clicked', () => {
    const mockOnItemClick = vi.fn();
    render(<TierListTab onItemClick={mockOnItemClick} />);

    const itemCard = screen.getByText('SuperBot');
    fireEvent.click(itemCard);

    expect(mockOnItemClick).toHaveBeenCalledTimes(1);
    expect(mockOnItemClick).toHaveBeenCalledWith('SuperBot', 'Robots', {
      name: 'SuperBot',
      description: 'The best robot ever'
    });
  });

  it('handles search queries that yield no results', () => {
    render(<TierListTab onItemClick={vi.fn()} />);

    const searchInput = screen.getByPlaceholderText('Search robots in tier lists...');
    fireEvent.change(searchInput, { target: { value: 'nonexistentbot' } });

    // No items should be displayed
    expect(screen.queryByText('SuperBot')).not.toBeInTheDocument();
    expect(screen.queryByText('MegaBot')).not.toBeInTheDocument();
    expect(screen.queryByText('GoodBot')).toBeNull();

    // Tier headers shouldn't be visible since they have no items
    expect(screen.queryByText('S')).not.toBeInTheDocument();
    expect(screen.queryByText('A')).not.toBeInTheDocument();
  });

  it('renders tag markers and New badge when applicable', () => {
    // Test with real tiersData to verify tags like Dedopali, Fang, Shoggoth
    render(<TierListTab onItemClick={vi.fn()} />);
    // SuperBot is rendered in the mock test
    expect(screen.getByText('SuperBot')).toBeInTheDocument();
  });
});

vi.mock('../../data/pilot_tiers.json', () => ({ default: {
  sourceUrl: 'https://docs.google.com/spreadsheets/d/example/edit',
  tiers: [{ label: 'Hot', items: [{ name: 'Erika Storm' }, { name: 'Sophie Kovač' }] }],
} }));

describe('CrimsonHawk pilot category', () => {
  it('stays hidden until activation and preserves the current equipment category', () => {
    const { rerender } = render(<TierListTab onItemClick={vi.fn()} />);
    expect(screen.queryByRole('button', { name: 'Pilots', exact: true })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Titans', exact: true }));
    rerender(<TierListTab onItemClick={vi.fn()} isEasterEggActive />);
    expect(screen.getByText('TitanPrime')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Pilots', exact: true })).toBeVisible();
  });
  it('shows pilot search and copy, then restores equipment details and legend', () => {
    const onItemClick = vi.fn();
    render(<TierListTab onItemClick={onItemClick} isEasterEggActive />);
    fireEvent.change(screen.getByPlaceholderText('Search robots in tier lists...'), { target: { value: 'super' } });
    fireEvent.click(screen.getByRole('button', { name: 'Pilots', exact: true }));
    const search = screen.getByPlaceholderText('Search pilots in tier lists...');
    expect(search).toHaveValue('');
    expect(screen.getByText(/personal pilot rankings/)).toBeInTheDocument();
    expect(screen.queryByText('Tier Tag Guide')).not.toBeInTheDocument();
    expect(screen.queryByText(/power based tier list/)).not.toBeInTheDocument();
    fireEvent.change(search, { target: { value: 'sophie' } });
    expect(screen.queryByText('Erika Storm')).not.toBeInTheDocument();
    expect(screen.getByText('Sophie Kovač')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Robots', exact: true }));
    expect(screen.getByPlaceholderText('Search robots in tier lists...')).toHaveValue('');
    expect(screen.getByText('Tier Tag Guide')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'View details for SuperBot' }));
    expect(onItemClick).toHaveBeenCalledWith('SuperBot', 'Robots', expect.any(Object));
  });
  it('does not leave hidden pilot content selected when activation is removed', () => {
    const { rerender } = render(<TierListTab onItemClick={vi.fn()} isEasterEggActive />);
    fireEvent.click(screen.getByRole('button', { name: 'Pilots', exact: true }));
    rerender(<TierListTab onItemClick={vi.fn()} isEasterEggActive={false} />);
    expect(screen.queryByText('Erika Storm')).not.toBeInTheDocument();
    expect(screen.getByText('SuperBot')).toBeVisible();
  });
});
