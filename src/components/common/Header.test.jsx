import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Header } from './Header';

describe('Header Component', () => {
  const defaultProps = {
    activeTab: 'dashboard',
    onTabChange: vi.fn(),
    isEasterEggActive: false,
  };

  it('renders the logo and title correctly', () => {
    render(<Header {...defaultProps} />);

    // Check for logo image and text
    expect(screen.getByAltText('War Robots Guide Logo')).toBeInTheDocument();
    expect(screen.getByText('War Robots Guide')).toBeInTheDocument();
  });

  it('renders all navigation tabs', () => {
    render(<Header {...defaultProps} />);

    const expectedTabs = [
      'Home',
      'Tier Lists',
      'Value Ratings',
      'Build Guides',
      'Specializations',
      'Pilot Skills',
      'Weapon DPS',
      'Hangar Analyzer'
    ];

    expectedTabs.forEach(tabLabel => {
      // Get by role to ensure accessibility and robustness (links instead of buttons)
      expect(screen.getByRole('link', { name: new RegExp(tabLabel, 'i') })).toBeInTheDocument();
    });
  });

  it('applies the active class to the correct tab', () => {
    const { rerender } = render(<Header {...defaultProps} activeTab="dashboard" />);

    // Check if Home tab is active
    let homeLink = screen.getByRole('link', { name: /home/i });
    expect(homeLink).toHaveClass('active');

    // Rerender with a different active tab
    rerender(<Header {...defaultProps} activeTab="tiers" />);

    // Home should no longer be active, Tier Lists should be active
    homeLink = screen.getByRole('link', { name: /home/i });
    expect(homeLink).not.toHaveClass('active');

    const tierListsLink = screen.getByRole('link', { name: /tier lists/i });
    expect(tierListsLink).toHaveClass('active');
  });

  it('calls onTabChange with correct ID when a tab is clicked', async () => {
    const onTabChangeMock = vi.fn();
    const user = userEvent.setup();
    render(<Header {...defaultProps} onTabChange={onTabChangeMock} />);

    // Click the Tier Lists tab
    const tierListsLink = screen.getByRole('link', { name: /tier lists/i });
    await user.click(tierListsLink);
    expect(onTabChangeMock).toHaveBeenCalledWith('tiers');

    // Click the Build Guides tab
    const buildGuidesLink = screen.getByRole('link', { name: /build guides/i });
    await user.click(buildGuidesLink);
    expect(onTabChangeMock).toHaveBeenCalledWith('builds');
  });

  it('calls onTabChange with dashboard when logo is clicked', async () => {
    const onTabChangeMock = vi.fn();
    const user = userEvent.setup();
    render(<Header {...defaultProps} onTabChange={onTabChangeMock} />);

    const logoLink = screen.getByRole('link', { name: /war robots guide logo/i });
    await user.click(logoLink);
    expect(onTabChangeMock).toHaveBeenCalledWith('dashboard');
  });

  it('applies standard styles when isEasterEggActive is false', () => {
    const { container } = render(<Header {...defaultProps} isEasterEggActive={false} />);
    const headerElement = container.querySelector('header');

    // Check that easter egg styles are NOT present by ensuring background is empty or transparent
    expect(headerElement.style.background).toBe('');
  });

  it('applies special styles when isEasterEggActive is true', () => {
    const { container } = render(<Header {...defaultProps} isEasterEggActive={true} />);
    const headerElement = container.querySelector('header');

    // Check that easter egg styles are present
    expect(headerElement.style.background).toContain('rgba(7, 8, 12, 0.35)');
    expect(headerElement.style.borderBottom).toContain('1px solid');
  });
});
