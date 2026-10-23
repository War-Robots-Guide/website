import { render, screen } from '@testing-library/react';
import { it, expect } from 'vitest';
import { ResourcesLinks } from './ResourcesLinks';

it('shows resource names without summaries or type labels', () => {
  render(<ResourcesLinks />);
  expect(screen.getByRole('link', { name: 'Mini Build Guides' })).toHaveAttribute('href', expect.stringContaining('docs.google.com/spreadsheets/'));
  expect(screen.getAllByRole('link')).toHaveLength(7);
  expect(screen.queryByText('Spreadsheet')).not.toBeInTheDocument();
  expect(screen.queryByText(/Optimal loadouts/)).not.toBeInTheDocument();
});
