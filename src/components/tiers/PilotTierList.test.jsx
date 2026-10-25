import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PilotTierList } from './PilotTierList';
vi.mock('../../utils/pilotTierImages', () => ({ getPilotTierImage: name => name === 'Erika Storm' ? '/erika.png' : null }));
const data = {
  sourceUrl: 'https://docs.google.com/spreadsheets/d/example/edit',
  tiers: [
    { label: 'Hot', items: [{ name: 'Erika Storm' }, { name: 'Sophie Kovač' }] },
    { label: 'Less hot but hot', items: [{ name: 'Erika Storm' }, { name: 'Yang Lee (Harpy / Siren)' }] },
  ],
};
describe('PilotTierList', () => {
  it('renders custom tiers and literal names in source order as static cards', () => {
    render(<PilotTierList data={data} searchQuery="" />);
    expect(screen.getAllByRole('heading').map(el => el.textContent)).toEqual(['Hot', 'Less hot but hot']);
    expect(screen.getAllByText('Erika Storm')).toHaveLength(2);
    expect(screen.getByText('Sophie Kovač')).toBeInTheDocument();
    expect(screen.getByText('Yang Lee (Harpy / Siren)')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
  it('filters names case insensitively, omitting empty tiers', () => {
    render(<PilotTierList data={data} searchQuery="SOPHIE" />);
    expect(screen.getByText('Sophie Kovač')).toBeInTheDocument();
    expect(screen.queryByText('Erika Storm')).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Less hot but hot' })).not.toBeInTheDocument();
  });
  it('shows a useful empty search state', () => {
    render(<PilotTierList data={data} searchQuery="unmatched" />);
    expect(screen.getByRole('status')).toHaveTextContent('No pilots match your search.');
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });
  it('uses placeholders for absent or broken portraits', () => {
    render(<PilotTierList data={data} searchQuery="" />);
    const sophie = screen.getByText('Sophie Kovač').closest('li');
    expect(within(sophie).queryByRole('img')).not.toBeInTheDocument();
    const erika = screen.getAllByText('Erika Storm')[0].closest('li');
    const image = within(erika).getByRole('img');
    fireEvent.error(image);
    expect(within(erika).queryByRole('img')).not.toBeInTheDocument();
    expect(within(erika).getByText('Erika Storm')).toBeVisible();
  });
});
