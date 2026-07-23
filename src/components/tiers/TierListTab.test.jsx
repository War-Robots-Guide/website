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
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the heading and description', () => {
    render(<TierListTab onItemClick={vi.fn()} />);
    expect(screen.getByText('Tier Lists')).toBeInTheDocument();
    expect(screen.getByText('A power based tier list that ranks every unit in the game.')).toBeInTheDocument();
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
    expect(screen.queryByText('GoodBot')).not.toBeInTheDocument();

    // Tier headers shouldn't be visible since they have no items
    expect(screen.queryByText('S')).not.toBeInTheDocument();
    expect(screen.queryByText('A')).not.toBeInTheDocument();
  });
});
