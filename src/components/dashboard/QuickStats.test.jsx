import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { QuickStats } from './QuickStats';

describe('QuickStats', () => {
  it('renders correct combined stats and individual stats', () => {
    const stats = {
      totalRobots: 10,
      totalTitans: 5,
      totalWeapons: 20,
      totalBuilds: 8,
    };
    render(<QuickStats stats={stats} />);

    // Total Robots + Titans = 15
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('Robots and Titans evaluated')).toBeInTheDocument();

    // Total Weapons = 20
    expect(screen.getByText('20')).toBeInTheDocument();
    expect(screen.getByText('Robot and Titan weapons tested')).toBeInTheDocument();

    // Total Builds = 8
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('Mini build guides')).toBeInTheDocument();
  });

  it('renders correctly with zero values', () => {
    const stats = {
      totalRobots: 0,
      totalTitans: 0,
      totalWeapons: 0,
      totalBuilds: 0,
    };
    render(<QuickStats stats={stats} />);

    // There should be three '0' elements rendered
    const zeros = screen.getAllByText('0');
    expect(zeros).toHaveLength(3);
  });

  it('renders all stat icons with correct alt text', () => {
    const stats = {
      totalRobots: 1,
      totalTitans: 1,
      totalWeapons: 1,
      totalBuilds: 1,
    };
    render(<QuickStats stats={stats} />);

    expect(screen.getByAltText('Robot Icon')).toBeInTheDocument();
    expect(screen.getByAltText('Weapon Icon')).toBeInTheDocument();
    expect(screen.getByAltText('Build Icon')).toBeInTheDocument();
  });
});
