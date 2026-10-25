import { render, screen, within } from '@testing-library/react';
import { it, expect } from 'vitest';
import { BuildDetailModal } from './BuildDetailModal';

it('shows both weapon sizes and separates passive specialization from active modules', () => {
  render(<BuildDetailModal build={{ robot: 'Princeps', is_titan: true, parsed_build_name: 'Assault', parsed_pilot: 'Vorren Kaal', best_weapons: 'Venire+Vincere', f2p_weapons: 'Arbiter+Equalizer', specialization: 'Damage Dealer (TNA+ODU)' }} onClose={() => {}} />);
  expect(screen.getByText('Venire')).toBeInTheDocument();
  expect(screen.getByText('Vincere')).toBeInTheDocument();
  expect(screen.getByText('Arbiter')).toBeInTheDocument();
  expect(screen.getByText('Equalizer')).toBeInTheDocument();
  expect(screen.getByText('Passive Specialization')).toBeInTheDocument();
  expect(screen.getByText('Active Module')).toBeInTheDocument();
  expect(screen.getByText('Titan Nuclear Amplifier')).toBeInTheDocument();
  expect(screen.getByText('Titan Overdrive Unit')).toBeInTheDocument();
  expect(screen.queryByText('Drone Options')).not.toBeInTheDocument();
});

it('renders wrapped drone notes and pilot choices as complete options', () => {
  render(<BuildDetailModal build={{ robot: 'Nuo', pilot: 'Walter Trommel\nBasil Lapatte\nHarold Han\n(With K-lasers)', drone_options: 'Solar\nAopo\n(Use Aopo for\nGauss+Weber)', specialization: 'Damage Dealer\n(Nuke Amp + Rangefinder)\nRepair or Phase Shift' }} onClose={() => {}} />);
  const drones = screen.getByRole('list', { name: 'Drone options' });
  expect(within(drones).getAllByRole('listitem')).toHaveLength(2);
  expect(within(drones).getByText('Use Aopo for Gauss+Weber')).toBeInTheDocument();
  const pilots = screen.getByRole('list', { name: 'Pilot options' });
  expect(within(pilots).getAllByRole('listitem')).toHaveLength(3);
  expect(within(pilots).getByText('With K-lasers')).toBeInTheDocument();
  expect(screen.getByRole('img', { name: 'Nuclear Amplifier' })).toBeInTheDocument();
  expect(screen.getByRole('img', { name: 'Phase Shift' })).toBeInTheDocument();
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
