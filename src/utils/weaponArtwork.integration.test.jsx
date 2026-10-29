import { fireEvent, render, screen, within } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { TierListTab } from '../components/tiers/TierListTab';

// Deployment refreshes tiers and artwork independently. Exercise their contract
// with a fixed library, including new weapons whose artwork has not arrived yet.
vi.mock('../data/tiers.json', () => ({
  default: {
    Robots: {},
    'Robot Weapons': {
      X: {
        casual_name: 'Top',
        items: [
          { name: 'Lumen L, Lumen M, Lumen H', description: 'Known family' },
          { name: 'Mesmer L, Mesmer M, Mesmer H', description: 'New family' },
          { name: 'UE Gust', description: 'New Ultimate weapon' },
        ],
      },
    },
    'Titan Weapons': {
      X: {
        casual_name: 'Top',
        items: [{ name: 'Barq-a. Barq-b', description: 'Known Titan family' }],
      },
    },
  },
}));

vi.mock('../data/image_manifest.json', () => ({
  default: {
    weapons: {
      lumenl: '/images/items/LumenL.png',
      lumenm: '/images/items/LumenM.png',
      lumenh: '/images/items/LumenH.png',
      barqa: '/images/items/BarqA.png',
      barqb: '/images/items/BarqB.png',
      // Standard artwork must not be substituted for a missing Ultimate image.
      gust: '/images/items/Gust.png',
    },
  },
}));

it('renders each known robot and Titan weapon family member with its own artwork', () => {
  render(<TierListTab onItemClick={vi.fn()} />);
  for (const [category, members] of [
    ['Robot Weapons', [['Lumen L', 'LumenL'], ['Lumen M', 'LumenM'], ['Lumen H', 'LumenH']]],
    ['Titan Weapons', [['Barq-a', 'BarqA'], ['Barq-b', 'BarqB']]],
  ]) {
    fireEvent.click(screen.getByRole('button', { name: category, exact: true }));
    for (const [name, filename] of members) {
      const card = screen.getByRole('button', { name: `View details for ${name}` });
      expect(within(card).getByRole('img', { name, exact: true }))
        .toHaveAttribute('src', `/images/items/${filename}.png`);
    }
  }
});

it('keeps newly listed weapons usable with placeholders until artwork is available', () => {
  const onItemClick = vi.fn();
  render(<TierListTab onItemClick={onItemClick} />);
  fireEvent.click(screen.getByRole('button', { name: 'Robot Weapons', exact: true }));

  for (const name of ['Mesmer L', 'Mesmer M', 'Mesmer H', 'UE Gust']) {
    const card = screen.getByRole('button', { name: `View details for ${name}` });
    expect(within(card).queryByRole('img', { name, exact: true })).not.toBeInTheDocument();
    expect(within(card).getByText('🤖')).toBeInTheDocument();
    fireEvent.click(card);
    expect(onItemClick).toHaveBeenLastCalledWith(name, 'Robot Weapons', expect.objectContaining({ name }));
  }
});
