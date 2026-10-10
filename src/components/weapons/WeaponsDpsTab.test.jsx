import { render, screen, fireEvent, act, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { WeaponsDpsTab } from './WeaponsDpsTab';

vi.mock('../../data/weapons_dps.json', () => ({
  default: {
    'Heavy Weapons': [
      {
        name: 'Heavy Puncher',
        burst_dps: 50000.0,
        cycle_dps: 20000.0,
        range: '500m',
        notes: 'High burst damage'
      },
      {
        name: 'Heavy Smuta',
        burst_dps: 45000.0,
        cycle_dps: 25000.0,
        range: '600m',
        notes: 'Homing bullets'
      },
      {
        name: 'Heavy Devastator',
        burst_dps: 60000.0,
        cycle_dps: 15000.0,
        range: '200m',
        notes: 'Sonic weapon'
      }
    ],
    'Medium Weapons': [
      {
        name: 'Medium Mace',
        burst_dps: 30000.0,
        cycle_dps: 15000.0,
        range: '500m',
        notes: 'Blast shotgun'
      }
    ],
    'Light Weapons': [],
    'Alpha Weapons': [],
    'Beta Weapons': []
  }
}));

describe('WeaponsDpsTab', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders initial state correctly with Heavy Weapons image cards', () => {
    render(<WeaponsDpsTab />);

    expect(screen.getByText('Weapon DPS Visualizer')).toBeInTheDocument();

    // Check if Heavy Weapons is active
    const heavyPill = screen.getByText('Heavy');
    expect(heavyPill).toHaveClass('active');

    // Check if Heavy Puncher is rendered
    expect(screen.getByText('Heavy Puncher')).toBeInTheDocument();
    expect(screen.getByText('High burst damage')).toBeInTheDocument();
  });

  it('changes weapon class when a tab pill is clicked', () => {
    render(<WeaponsDpsTab />);

    expect(screen.getByText('Heavy Puncher')).toBeInTheDocument();

    const mediumPill = screen.getByText('Medium');
    fireEvent.click(mediumPill);

    expect(mediumPill).toHaveClass('active');
    expect(screen.queryByText('Heavy Puncher')).not.toBeInTheDocument();
    expect(screen.getByText('Medium Mace')).toBeInTheDocument();
  });

  it('filters weapons using the search input with debounce', async () => {
    render(<WeaponsDpsTab />);

    const searchInput = screen.getByPlaceholderText('Search heavy weapons...');

    expect(screen.getByText('Heavy Puncher')).toBeInTheDocument();
    expect(screen.getByText('Heavy Smuta')).toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: 'Smuta' } });

    expect(screen.getByText('Heavy Puncher')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(250);
    });

    expect(screen.getByText('Heavy Smuta')).toBeInTheDocument();
    expect(screen.queryByText('Heavy Puncher')).not.toBeInTheDocument();
  });

  it('sorts weapons by Burst DPS by default and allows sorting by Cycle DPS', () => {
    render(<WeaponsDpsTab />);

    // By default sorted by Burst DPS: Heavy Devastator (60k), Heavy Puncher (50k), Heavy Smuta (45k)
    const headings = screen.getAllByRole('heading', { level: 4 }).map(h => h.textContent);
    expect(headings).toEqual(['Heavy Devastator', 'Heavy Puncher', 'Heavy Smuta']);

    // Switch sort to Cycle DPS
    const sortSelect = screen.getByDisplayValue('Sort by Burst DPS (Default)');
    fireEvent.change(sortSelect, { target: { value: 'cycle_dps' } });

    // Sorted by Cycle DPS: Heavy Smuta (25k), Heavy Puncher (20k), Heavy Devastator (15k)
    const cycleHeadings = screen.getAllByRole('heading', { level: 4 }).map(h => h.textContent);
    expect(cycleHeadings).toEqual(['Heavy Smuta', 'Heavy Puncher', 'Heavy Devastator']);
  });

  it('opens weapon detail modal with relative DPS bar when clicked', () => {
    render(<WeaponsDpsTab />);

    const card = screen.getByRole('button', { name: 'View DPS details for Heavy Puncher' });
    fireEvent.click(card);

    // Modal opens showing title, range, notes
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText('High burst damage')).toBeInTheDocument();
    expect(within(dialog).getAllByText(/of class max/i)).toHaveLength(2);

    // Close modal
    const closeBtn = screen.getByLabelText('Close modal');
    fireEvent.click(closeBtn);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
