import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { DashboardHero } from './DashboardHero';

describe('DashboardHero Component', () => {
  it('renders the hero banner container with correct classes and styles', () => {
    render(<DashboardHero />);

    // The main container doesn't have an implicit role that is easy to query without adding data-testid,
    // so we can query by a contained element and get the parent, or check the image first.
    // A better approach is testing what the user sees.

    const image = screen.getByRole('img', { name: /war robots hangar banner/i });
    expect(image).toBeInTheDocument();
    expect(image).toHaveClass('dashboard-hero-img');
    expect(image).toHaveAttribute('src', 'banner.jpg');

    // Check the container of the image
    const container = image.parentElement;
    expect(container).toHaveClass('hero-banner');

    // Check for inline style presence
    expect(container.style.overflow).not.toBe('');
    expect(container.style.position).not.toBe('');
    expect(container.style.padding).not.toBe('');
  });

  it('renders the title and description correctly', () => {
    render(<DashboardHero />);

    const title = screen.getByRole('heading', { level: 1, name: /welcome to the wrg database/i });
    expect(title).toBeInTheDocument();
    expect(title).toHaveClass('dashboard-hero-title');

    // Query the text content using a custom matcher or string
    const descriptionText = screen.getByText(/Welcome to the database compiled by the expert community at/i);
    expect(descriptionText).toBeInTheDocument();

    // Check for the highlighted text span
    const highlightedText = screen.getByText(/War Robots Guide/i);
    expect(highlightedText).toBeInTheDocument();
    expect(highlightedText.tagName).toBe('SPAN');
    expect(highlightedText.style.fontWeight).not.toBe('');
  });
});
