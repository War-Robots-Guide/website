import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { CommunityLinks } from './CommunityLinks';

describe('CommunityLinks Component', () => {
  it('renders the component and its heading', () => {
    render(<CommunityLinks />);

    // Check for the main heading
    expect(screen.getByText(/Join our Official Communities/i)).toBeInTheDocument();

    // Check for the description text
    expect(screen.getByText(/Meet fellow commanders, discuss guides/i)).toBeInTheDocument();
  });

  it('renders the correct links with appropriate attributes', () => {
    render(<CommunityLinks />);

    // Reddit link
    const redditLink = screen.getByRole('link', { name: /Check out our subreddit!/i });
    expect(redditLink).toBeInTheDocument();
    expect(redditLink).toHaveAttribute('href', 'https://www.reddit.com/r/WarRobotsGuide/');
    expect(redditLink).toHaveAttribute('target', '_blank');
    expect(redditLink).toHaveAttribute('rel', 'noopener noreferrer');

    // Discord link
    const discordLink = screen.getByRole('link', { name: /Join our Discord!/i });
    expect(discordLink).toBeInTheDocument();
    expect(discordLink).toHaveAttribute('href', 'https://discord.gg/FPxpXthPS');
    expect(discordLink).toHaveAttribute('target', '_blank');
    expect(discordLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders the community icons', () => {
    render(<CommunityLinks />);

    // Reddit icon
    const redditIcon = screen.getByAltText('Reddit');
    expect(redditIcon).toBeInTheDocument();
    expect(redditIcon).toHaveAttribute('src', '/icons/reddit_logo.png');

    // Discord icon
    const discordIcon = screen.getByAltText('Discord');
    expect(discordIcon).toBeInTheDocument();
    expect(discordIcon).toHaveAttribute('src', '/icons/discord_logo.png');

    // Hangar icon (empty alt text in component)
    const images = screen.getAllByRole('presentation', { hidden: true });
    const hangarIcon = images.find(img => img.getAttribute('src') === '/icons/clan_hangar_gold.png');
    expect(hangarIcon).toBeInTheDocument();
  });
});
