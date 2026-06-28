import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { HangarSelectorModal } from './HangarSelectorModal';

vi.mock('../../data/robot_guide.json', () => {
  return {
    default: {
      robots: [
        { name: 'Cossack', value_rating: 3, roles: [{ role: 'Beacon Runner', type: 'primary' }] },
        { name: 'Destrier', value_rating: 2, roles: [] },
        { name: 'Gareth', value_rating: 4, roles: [{ role: 'Brawler', type: 'primary' }] },
      ],
      titans: [
        { name: 'Arthur', value_rating: 2 },
        { name: 'Luchador', value_rating: 5 },
      ]
    }
  };
});

// Mock child components
vi.mock('../common/RatingBar', () => ({
  RatingBar: ({ rating, unitType }) => <div data-testid="rating-bar">{rating} - {unitType}</div>
}));

vi.mock('../common/SearchInput', () => ({
  SearchInput: ({ value, onChange, placeholder, ...props }) => (
    <input
      data-testid="search-input"
      value={value || ''}
      onChange={onChange}
      placeholder={placeholder}
      {...props}
    />
  )
}));

describe('HangarSelectorModal Initial Rendering', () => {
  it('renders modal for a robot slot', () => {
    render(
      <HangarSelectorModal
        activeSlot={2}
        selectorSearchQuery=""
        setSelectorSearchQuery={vi.fn()}
        onClose={vi.fn()}
        onSelect={vi.fn()}
      />
    );

    // Modal title for robot
    expect(screen.getByText('Select Robot for Slot 3')).toBeInTheDocument();

    // Search input placeholder
    expect(screen.getByPlaceholderText('Search Robots...')).toBeInTheDocument();

    // List of robots from mock
    expect(screen.getByText('Cossack')).toBeInTheDocument();
    expect(screen.getByText('Destrier')).toBeInTheDocument();
    expect(screen.getByText('Gareth')).toBeInTheDocument();

    // Should not render titans
    expect(screen.queryByText('Arthur')).not.toBeInTheDocument();
  });

  it('renders modal for a titan slot', () => {
    render(
      <HangarSelectorModal
        activeSlot={5}
        selectorSearchQuery=""
        setSelectorSearchQuery={vi.fn()}
        onClose={vi.fn()}
        onSelect={vi.fn()}
      />
    );

    // Modal title for titan
    expect(screen.getByText('Select Titan')).toBeInTheDocument();

    // Search input placeholder
    expect(screen.getByPlaceholderText('Search Titans...')).toBeInTheDocument();

    // List of titans from mock
    expect(screen.getByText('Arthur')).toBeInTheDocument();
    expect(screen.getByText('Luchador')).toBeInTheDocument();

    // Should not render robots
    expect(screen.queryByText('Cossack')).not.toBeInTheDocument();
  });
});

describe('HangarSelectorModal Search and Filtering', () => {
  it('filters robots based on search query', () => {
    render(
      <HangarSelectorModal
        activeSlot={0}
        selectorSearchQuery="gar"
        setSelectorSearchQuery={vi.fn()}
        onClose={vi.fn()}
        onSelect={vi.fn()}
      />
    );

    // Should only show Gareth
    expect(screen.getByText('Gareth')).toBeInTheDocument();

    // Should not show other robots
    expect(screen.queryByText('Cossack')).not.toBeInTheDocument();
    expect(screen.queryByText('Destrier')).not.toBeInTheDocument();
  });

  it('filters titans based on search query', () => {
    render(
      <HangarSelectorModal
        activeSlot={5}
        selectorSearchQuery="luch"
        setSelectorSearchQuery={vi.fn()}
        onClose={vi.fn()}
        onSelect={vi.fn()}
      />
    );

    // Should only show Luchador
    expect(screen.getByText('Luchador')).toBeInTheDocument();

    // Should not show other titans
    expect(screen.queryByText('Arthur')).not.toBeInTheDocument();
  });

  it('displays empty state when no results match', () => {
    render(
      <HangarSelectorModal
        activeSlot={0}
        selectorSearchQuery="unknownrobot"
        setSelectorSearchQuery={vi.fn()}
        onClose={vi.fn()}
        onSelect={vi.fn()}
      />
    );

    expect(screen.getByText('No results found matching "unknownrobot"')).toBeInTheDocument();
    expect(screen.queryByText('Cossack')).not.toBeInTheDocument();
  });

  it('calls setSelectorSearchQuery when typing in the search input', async () => {
    const mockSetSelectorSearchQuery = vi.fn();
    const user = userEvent.setup();
    render(
      <HangarSelectorModal
        activeSlot={0}
        selectorSearchQuery=""
        setSelectorSearchQuery={mockSetSelectorSearchQuery}
        onClose={vi.fn()}
        onSelect={vi.fn()}
      />
    );

    const input = screen.getByTestId('search-input');
    await user.type(input, 'a');

    expect(mockSetSelectorSearchQuery).toHaveBeenCalledTimes(1);
    // Since input is mocked to just call onChange and we typed 'a'
    // in our mocked SearchInput, it forwards the event.
    // userEvent.type actually sends multiple events.
    // The exact argument shape depends on our simple mock which forwards the event.
  });
});

describe('HangarSelectorModal User Interactions', () => {
  it('calls onSelect when a robot is clicked', async () => {
    const mockOnSelect = vi.fn();
    const user = userEvent.setup();
    render(
      <HangarSelectorModal
        activeSlot={1}
        selectorSearchQuery=""
        setSelectorSearchQuery={vi.fn()}
        onClose={vi.fn()}
        onSelect={mockOnSelect}
      />
    );

    const cossackOption = screen.getByText('Cossack').closest('[role="option"]');
    await user.click(cossackOption);

    expect(mockOnSelect).toHaveBeenCalledTimes(1);
    expect(mockOnSelect).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Cossack', value_rating: 3 })
    );
  });

  it('calls onSelect when Enter is pressed on an option', async () => {
    const mockOnSelect = vi.fn();
    const user = userEvent.setup();
    render(
      <HangarSelectorModal
        activeSlot={5}
        selectorSearchQuery=""
        setSelectorSearchQuery={vi.fn()}
        onClose={vi.fn()}
        onSelect={mockOnSelect}
      />
    );

    const arthurOption = screen.getByText('Arthur').closest('[role="option"]');
    arthurOption.focus();
    await user.keyboard('{Enter}');

    expect(mockOnSelect).toHaveBeenCalledTimes(1);
    expect(mockOnSelect).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Arthur', value_rating: 2 })
    );
  });

  it('calls onSelect when Space is pressed on an option', async () => {
    const mockOnSelect = vi.fn();
    const user = userEvent.setup();
    render(
      <HangarSelectorModal
        activeSlot={0}
        selectorSearchQuery=""
        setSelectorSearchQuery={vi.fn()}
        onClose={vi.fn()}
        onSelect={mockOnSelect}
      />
    );

    const destrierOption = screen.getByText('Destrier').closest('[role="option"]');
    destrierOption.focus();
    await user.keyboard(' ');

    expect(mockOnSelect).toHaveBeenCalledTimes(1);
    expect(mockOnSelect).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Destrier', value_rating: 2 })
    );
  });

  it('calls onClose when the close button is clicked', async () => {
    const mockOnClose = vi.fn();
    const user = userEvent.setup();
    render(
      <HangarSelectorModal
        activeSlot={0}
        selectorSearchQuery=""
        setSelectorSearchQuery={vi.fn()}
        onClose={mockOnClose}
        onSelect={vi.fn()}
      />
    );

    const closeButton = screen.getByLabelText('Close selector');
    await user.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when the overlay is clicked', async () => {
    const mockOnClose = vi.fn();
    const user = userEvent.setup();
    render(
      <HangarSelectorModal
        activeSlot={0}
        selectorSearchQuery=""
        setSelectorSearchQuery={vi.fn()}
        onClose={mockOnClose}
        onSelect={vi.fn()}
      />
    );

    const overlay = screen.getByRole('dialog');
    await user.click(overlay);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when the modal content is clicked', async () => {
    const mockOnClose = vi.fn();
    const user = userEvent.setup();
    render(
      <HangarSelectorModal
        activeSlot={0}
        selectorSearchQuery=""
        setSelectorSearchQuery={vi.fn()}
        onClose={mockOnClose}
        onSelect={vi.fn()}
      />
    );

    // Get the title to click inside the content
    const title = screen.getByText('Select Robot for Slot 1');
    await user.click(title);

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('calls onClose when the Escape key is pressed', async () => {
    const mockOnClose = vi.fn();
    const user = userEvent.setup();
    render(
      <HangarSelectorModal
        activeSlot={0}
        selectorSearchQuery=""
        setSelectorSearchQuery={vi.fn()}
        onClose={mockOnClose}
        onSelect={vi.fn()}
      />
    );

    await user.keyboard('{Escape}');

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
