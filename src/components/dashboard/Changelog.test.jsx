import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Changelog } from './Changelog';

describe('Changelog Component', () => {
  it('renders the changelog title and icon', () => {
    render(<Changelog recentChangelog={[]} />);

    // Title
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Changelog');

    // Icon - role is presentation since alt text is empty
    const icon = screen.getByRole('presentation', { hidden: true });
    expect(icon).toBeInTheDocument();
  });

  it('renders a list of changelog entries correctly', () => {
    const mockData = [
      { date: '2023-10-01', text: 'Added new robot: Destrier' },
      { date: '2023-10-02', text: 'Fixed bug in weapon stats' },
    ];

    render(<Changelog recentChangelog={mockData} />);

    // Verify dates
    expect(screen.getByText('2023-10-01')).toBeInTheDocument();
    expect(screen.getByText('2023-10-02')).toBeInTheDocument();

    // Verify texts
    expect(screen.getByText('Added new robot: Destrier')).toBeInTheDocument();
    expect(screen.getByText('Fixed bug in weapon stats')).toBeInTheDocument();
  });

  it('renders without crashing when recentChangelog is empty', () => {
    const { container } = render(<Changelog recentChangelog={[]} />);

    // Only the header and an empty container should be rendered
    expect(screen.queryByText(/2023-/)).not.toBeInTheDocument();

    // Find the container for entries and check if it's empty
    const entriesContainer = container.querySelector('div[style*="max-height"]');
    expect(entriesContainer).toBeInTheDocument();
    expect(entriesContainer.children.length).toBe(0);
  });
});
