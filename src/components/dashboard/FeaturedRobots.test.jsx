import { render, screen, within } from '@testing-library/react';
import { expect, it } from 'vitest';
import { FeaturedRobots } from './FeaturedRobots';

it.each([
  { accessibility: 0, value_rating: 50, isMeta: false, expected: 'Meta' },
  { accessibility: 3, value_rating: 50, isMeta: false, expected: 'Meta' },
  { accessibility: 4, value_rating: 10, isMeta: true, expected: 'F2P' },
  { accessibility: 10, value_rating: 10, isMeta: true, expected: 'F2P' },
])('uses accessibility $accessibility for the $expected badge', ({ accessibility, value_rating, isMeta, expected }) => {
  render(<FeaturedRobots featuredRobots={[{
    name: 'Test Robot', scores: { accessibility }, value_rating, isMeta,
  }]} handleCardClick={() => {}} />);
  const card = within(screen.getByRole('button', { name: 'View details for Test Robot in tier list' }));
  expect(card.getByText(expected)).toBeVisible();
  expect(card.queryByText(expected === 'Meta' ? 'F2P' : 'Meta')).not.toBeInTheDocument();
});
