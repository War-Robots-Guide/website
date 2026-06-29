import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Footer } from './Footer';

describe('Footer Component', () => {
  it('renders the footer content correctly', () => {
    render(<Footer />);

    // Check if the main text content is rendered
    expect(screen.getByText(/War Robots Guide Website/i)).toBeInTheDocument();
    expect(screen.getByText('Adazahi')).toBeInTheDocument();
    expect(screen.getByText(/Spiritings, Tropical/i)).toBeInTheDocument();

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

  it('calls onAdazahiClick callback when the Adazahi name is clicked', async () => {
    const mockOnClick = vi.fn();
    const user = userEvent.setup();

    render(<Footer onAdazahiClick={mockOnClick} />);

    const adazahiSpan = screen.getByText('Adazahi');
    await user.click(adazahiSpan);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('does not crash when clicked if callbacks are not provided', async () => {
    const user = userEvent.setup();

    // Render without providing callbacks
    render(<Footer />);

    const developerSpan = screen.getByText('CrimsonHawk');
    const adazahiSpan = screen.getByText('Adazahi');

    // This should not throw an error
    await user.click(developerSpan);
    await user.click(adazahiSpan);
  });
});
