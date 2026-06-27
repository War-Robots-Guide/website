import { render, screen, fireEvent, waitFor, within, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { WeaponsDpsTab } from './WeaponsDpsTab';

// Mock weapons data (including legacy/expected weapons.json for code review purposes)
vi.mock('../../data/weapons.json', () => ({
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
      },
      {
        name: 'Heavy Bane',
        burst_dps: 40000.0,
        cycle_dps: 30000.0,
        range: '300m',
        notes: 'Acid damage'
      },
      {
        name: 'Heavy Ember',
        burst_dps: 35000.0,
        cycle_dps: 35000.0,
        range: '350m',
        notes: 'Flamethrower'
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
      },
      {
        name: 'Heavy Bane',
        burst_dps: 40000.0,
        cycle_dps: 30000.0,
        range: '300m',
        notes: 'Acid damage'
      },
      {
        name: 'Heavy Ember',
        burst_dps: 35000.0,
        cycle_dps: 35000.0,
        range: '350m',
        notes: 'Flamethrower'
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
  let alertMock;

  beforeEach(() => {
    alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
    vi.useFakeTimers();
  });

  afterEach(() => {
    alertMock.mockRestore();
    vi.useRealTimers();
  });

  it('renders initial state correctly with Heavy Weapons', () => {
    render(<WeaponsDpsTab />);

    expect(screen.getByText('Weapon DPS Calculator & Comparison')).toBeInTheDocument();

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

    // Initially all 5 heavy weapons are visible
    expect(screen.getByText('Heavy Puncher')).toBeInTheDocument();
    expect(screen.getByText('Heavy Smuta')).toBeInTheDocument();

    // Type in the search box
    fireEvent.change(searchInput, { target: { value: 'Smuta' } });

    // Before timer advances, all should still be visible
    expect(screen.getByText('Heavy Puncher')).toBeInTheDocument();

    // Advance timers
    act(() => {
      vi.advanceTimersByTime(250);
    });

    expect(screen.getByText('Heavy Smuta')).toBeInTheDocument();
    expect(screen.queryByText('Heavy Puncher')).not.toBeInTheDocument();
  });

  it('adds and removes a weapon to the comparison list', () => {
    const { container } = render(<WeaponsDpsTab />);

    // Find checkboxes
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBeGreaterThan(0);

    // Add first weapon to comparison
    fireEvent.click(checkboxes[0]);

    // Comparison bar should appear
    expect(screen.getByText('WEAPON COMPARISON (1/4)')).toBeInTheDocument();

    // Chart should appear
    expect(screen.getByText('Weapon DPS visualizer')).toBeInTheDocument();

    // Remove the weapon using the remove button in the comparison bar
    const removeBtn = container.querySelector('.remove-weapon-btn');
    expect(removeBtn).not.toBeNull();

    fireEvent.click(removeBtn);

    // Comparison bar and chart should disappear
    expect(screen.queryByText('WEAPON COMPARISON (1/4)')).not.toBeInTheDocument();
    expect(screen.queryByText('Weapon DPS visualizer')).not.toBeInTheDocument();
  });

  it('limits weapon comparison to 4 weapons and alerts on 5th', () => {
    render(<WeaponsDpsTab />);

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBe(5); // 5 heavy weapons

    // Add 4 weapons
    for (let i = 0; i < 4; i++) {
      fireEvent.click(checkboxes[i]);
    }

    expect(screen.getByText('WEAPON COMPARISON (4/4)')).toBeInTheDocument();

    // Attempt to add 5th weapon
    fireEvent.click(checkboxes[4]);

    expect(alertMock).toHaveBeenCalledWith('You can compare up to 4 weapons at a time.');

    // Still at 4/4
    expect(screen.getByText('WEAPON COMPARISON (4/4)')).toBeInTheDocument();
  });
});
