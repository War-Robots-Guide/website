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

it('keeps members together and gives each weapon family a separate row', () => {
  render(<BuildDetailModal build={{ robot: 'Imugi', parsed_build_name: 'Assault', best_weapons: 'Fahrenheit+Celsius\nMachiara+Velos', f2p_weapons: 'Mace+Cudgel\nAtomizer+Quarker', specialization: 'Brawler' }} onClose={() => {}} />);
  const metaRows = screen.getByRole('list', { name: 'Meta weapon families' }).querySelectorAll('[role="listitem"]');
  expect(metaRows).toHaveLength(2);
  expect(metaRows[0]).toHaveTextContent('Fahrenheit');
  expect(metaRows[0]).toHaveTextContent('Celsius');
  expect(metaRows[1]).toHaveTextContent('Machiara');
  expect(metaRows[1]).toHaveTextContent('Velos');
  const f2pRows = screen.getByRole('list', { name: 'F2P weapon families' }).querySelectorAll('[role="listitem"]');
  expect(f2pRows).toHaveLength(2);
  expect(f2pRows[0]).toHaveTextContent('Mace');
  expect(f2pRows[0]).toHaveTextContent('Cudgel');
});

it('keeps a family together when the source wraps a line after a plus sign', () => {
  render(<BuildDetailModal build={{ robot: 'Skyros', parsed_build_name: 'Assault', best_weapons: 'HarmattanL+HarmattanM+\nHarmattanH\nUE Burst Weapons', specialization: 'Brawler' }} onClose={() => {}} />);
  const rows = screen.getByRole('list', { name: 'Meta weapon families' }).querySelectorAll('[role="listitem"]');
  expect(rows).toHaveLength(2);
  expect(rows[0]).toHaveTextContent('HarmattanL');
  expect(rows[0]).toHaveTextContent('HarmattanM');
  expect(rows[0]).toHaveTextContent('HarmattanH');
});
