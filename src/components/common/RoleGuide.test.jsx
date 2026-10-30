import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { RoleGuide } from './RoleGuide';

it.each(['Robots', 'Titans'])('shows the role icons alongside definitions for %s', category => {
  render(<RoleGuide category={category} />);
  expect(screen.getByRole('img', { name: 'Support role' })).toHaveAttribute('src', '/images/icons/Support.png');
  expect(screen.getByRole('img', { name: 'Midrange role' })).toHaveAttribute('src', '/images/icons/Midranger.png');
  expect(screen.getByRole('img', { name: 'Beacon Runner role' })).toHaveAttribute('src', '/images/icons/Beacon Runner.png');
});
