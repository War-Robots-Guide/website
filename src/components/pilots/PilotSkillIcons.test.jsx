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

  it.each([
    ['Robot Pilots', 'Cunning Opportunist, Wise Opportunist, Bounty hunter', 'Cunning Opportunist, Wise Opportunist, Bounty hunter.png'],
    ['Titan Pilots', 'Wise Opportunist', 'Cunning Opportunist, Wise Opportunist, Bounty hunter.png'],
    ['Titan Pilots', 'Adamant Road Hog, Adamant Gunsmith, Adamant Mechanic', 'Adamant Road Hog, Adamant Gunsmith, Adamant Mechanic, Raider Mechanic, Invulnerable Raider, Ninja.png'],
    ['Titan Pilots', 'Raider Mechanic, Invulnerable Raider, Ninja', 'Adamant Road Hog, Adamant Gunsmith, Adamant Mechanic, Raider Mechanic, Invulnerable Raider, Ninja.png'],
  ])('shows the shared icon on %s for %s', (tab, name, file) => {
    render(<PilotSkillsTab />);
    fireEvent.click(screen.getByText(tab));
    const icons = screen.getByText(name).parentElement.querySelectorAll('img');
    expect(icons).toHaveLength(1);
    expect(icons[0]).toHaveAttribute('src', `/pilot-skills/${encodeURIComponent(file)}`);
  });
});
