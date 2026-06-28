import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Footer } from './Footer';

describe('Footer Component', () => {
  it('renders the footer content correctly', () => {
    render(<Footer />);

    // Check if the main text content is rendered
    expect(screen.getByText(/War Robots Guide Website\. Compiled by Adazahi, Spiritings, Tropical, mistermaths, and Running Riot\./i)).toBeInTheDocument();

    // Check if the developer name is rendered
    expect(screen.getByText('CrimsonHawk')).toBeInTheDocument();
  });

  it('calls onDeveloperClick callback when the developer name is clicked', async () => {
    const mockOnClick = vi.fn();
    const user = userEvent.setup();

    render(<Footer onDeveloperClick={mockOnClick} />);

    const developerSpan = screen.getByText('CrimsonHawk');
    await user.click(developerSpan);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('does not crash when clicked if onDeveloperClick is not provided', async () => {
    const user = userEvent.setup();

    // Render without providing onDeveloperClick
    render(<Footer />);

    const developerSpan = screen.getByText('CrimsonHawk');

    // This should not throw an error
    await user.click(developerSpan);
  });
});
