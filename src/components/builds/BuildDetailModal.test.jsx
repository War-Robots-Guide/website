import { render, screen } from '@testing-library/react';
import { it, expect } from 'vitest';
import { BuildDetailModal } from './BuildDetailModal';

it('shows both weapon sizes for a mixed-slot Titan build and specialization text once', () => {
  render(<BuildDetailModal build={{ robot: 'Princeps', is_titan: true, parsed_build_name: 'Assault', parsed_pilot: 'Vorren Kaal', best_weapons: 'Venire+Vincere', f2p_weapons: 'Arbiter+Equalizer', specialization: 'Damage Dealer (TNA+ODU)' }} onClose={() => {}} />);
  expect(screen.getByText('Venire')).toBeInTheDocument();
  expect(screen.getByText('Vincere')).toBeInTheDocument();
  expect(screen.getByText('Arbiter')).toBeInTheDocument();
  expect(screen.getByText('Equalizer')).toBeInTheDocument();
  expect(screen.getAllByText('Damage Dealer (TNA+ODU)')).toHaveLength(1);
  expect(screen.queryByText('Drone Options')).not.toBeInTheDocument();
});
