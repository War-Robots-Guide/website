import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PilotSkillsTab } from './PilotSkillsTab';

describe('pilot skill icons', () => {
  it('shows the shared icon beside a robot skill and the titan-specific icon after switching tabs', () => {
    render(<PilotSkillsTab />);
    expect(screen.getByText('Mechanic').parentElement.querySelector('img')).toHaveAttribute('src', expect.stringContaining('Mechanic%2C%20Wonderworker'));
    fireEvent.click(screen.getByText('Titan Pilots'));
    expect(screen.getByText('Defense Expert, Ferocious Guardian').parentElement.querySelector('img')).toHaveAttribute('src', expect.stringContaining('titans'));
  });
});
