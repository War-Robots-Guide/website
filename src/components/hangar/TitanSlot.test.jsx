import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { TitanSlot } from './TitanSlot';

// Mock the child components to simplify testing
vi.mock('../common/RatingBar', () => ({
  RatingBar: ({ rating, unitType }) => <div data-testid="rating-bar">{rating} - {unitType}</div>
}));

describe('TitanSlot', () => {
  let user;

  beforeEach(() => {
    user = userEvent.setup();
    vi.clearAllMocks();
  });

  // Empty state tests
  describe('when empty', () => {
    it('renders the empty state correctly', () => {
      render(<TitanSlot item={null} onOpenSelector={vi.fn()} onClearSlot={vi.fn()} />);

      expect(screen.getByText('TITAN SLOT')).toBeInTheDocument();
      expect(screen.getByText('+')).toBeInTheDocument();
      expect(screen.getByText('Click to select')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Select Titan' })).toBeInTheDocument();
    });

    it('calls onOpenSelector with 5 when clicked', async () => {
      const mockOnOpenSelector = vi.fn();
      render(<TitanSlot item={null} onOpenSelector={mockOnOpenSelector} onClearSlot={vi.fn()} />);

      const slot = screen.getByRole('button', { name: 'Select Titan' });
      await user.click(slot);

      expect(mockOnOpenSelector).toHaveBeenCalledWith(5);
    });

    it('calls onOpenSelector with 5 when Enter is pressed', async () => {
      const mockOnOpenSelector = vi.fn();
      render(<TitanSlot item={null} onOpenSelector={mockOnOpenSelector} onClearSlot={vi.fn()} />);

      const slot = screen.getByRole('button', { name: 'Select Titan' });
      slot.focus();
      await user.keyboard('{Enter}');

      expect(mockOnOpenSelector).toHaveBeenCalledWith(5);
    });

    it('calls onOpenSelector with 5 when Space is pressed', async () => {
      const mockOnOpenSelector = vi.fn();
      render(<TitanSlot item={null} onOpenSelector={mockOnOpenSelector} onClearSlot={vi.fn()} />);

      const slot = screen.getByRole('button', { name: 'Select Titan' });
      slot.focus();
      await user.keyboard(' ');

      expect(mockOnOpenSelector).toHaveBeenCalledWith(5);
    });
  });

  // Filled state tests
  describe('when filled', () => {
    const mockTitan = {
      name: 'Luchador',
      value_rating: 5
    };

    it('renders the filled state correctly', () => {
      render(<TitanSlot item={mockTitan} onOpenSelector={vi.fn()} onClearSlot={vi.fn()} />);

      expect(screen.getByText('Titan Slot')).toBeInTheDocument();
      expect(screen.getByText('Luchador')).toBeInTheDocument();
      expect(screen.getByTestId('rating-bar')).toHaveTextContent('5 - titan');
    });

    it('calls onClearSlot with 5 when clear button is clicked', async () => {
      const mockOnClearSlot = vi.fn();
      render(<TitanSlot item={mockTitan} onOpenSelector={vi.fn()} onClearSlot={mockOnClearSlot} />);

      const clearBtn = screen.getByRole('button', { name: 'Clear slot' });
      await user.click(clearBtn);

      expect(mockOnClearSlot).toHaveBeenCalledWith(5, expect.any(Object));
    });
  });
});
