import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it } from 'vitest';
import { GuideDisclosure } from './GuideDisclosure';

it('opens with the keyboard and connects its button to the content', async () => {
  const user = userEvent.setup();
  render(<GuideDisclosure title="Methodology"><p>Rating definitions</p></GuideDisclosure>);
  const toggle = screen.getByRole('button', { name: 'Methodology' });
  expect(toggle).toHaveAttribute('aria-expanded', 'false');
  expect(screen.queryByText('Rating definitions')).not.toBeInTheDocument();
  toggle.focus();
  await user.keyboard('{Enter}');
  expect(toggle).toHaveAttribute('aria-expanded', 'true');
  expect(screen.getByText('Rating definitions').parentElement.id).toBe(toggle.getAttribute('aria-controls'));
  await user.keyboard(' ');
  expect(toggle).toHaveAttribute('aria-expanded', 'false');
});
