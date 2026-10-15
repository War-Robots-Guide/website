import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { WeaponComparison } from './WeaponComparison';

const weapons = [
  { id: 'heavy:1', weaponClass: 'Heavy Weapons', name: 'Test Heavy', nameLower: 'test heavy', burstNum: 100, cycleNum: 50, burst_dps: 100, cycle_dps: 50 },
  { id: 'light:1', weaponClass: 'Light Weapons', name: 'Test Light', nameLower: 'test light', burstNum: 200, cycleNum: 80, burst_dps: 200, cycle_dps: 80 },
];
describe('Weapon comparison', () => {
  it('searches across classes, adds independent graphs on a shared scale, and removes selections', () => {
    render(<WeaponComparison weapons={weapons} />);
    const search = screen.getByLabelText('Search weapons to compare');
    fireEvent.change(search, { target: { value: 'heavy' } });
    fireEvent.click(screen.getByRole('button', { name: 'Test Heavy · Heavy Weapons' }));
    fireEvent.change(search, { target: { value: 'light' } });
    fireEvent.click(screen.getByRole('button', { name: 'Test Light · Light Weapons' }));
    const heavyGraph = screen.getByRole('img', { name: /Test Heavy: Burst/ });
    const lightGraph = screen.getByRole('img', { name: /Test Light: Burst/ });
    expect(within(heavyGraph).getByText('200 DPS')).toBeInTheDocument();
    expect(within(lightGraph).getByText('200 DPS')).toBeInTheDocument();
    expect(heavyGraph.querySelector('rect')).toHaveAttribute('width', '140');
    expect(lightGraph.querySelector('rect')).toHaveAttribute('width', '280');
    fireEvent.click(screen.getByRole('button', { name: 'Remove Test Heavy from comparison' }));
    expect(screen.queryByRole('img', { name: /Test Heavy: Burst/ })).not.toBeInTheDocument();
  });
});
