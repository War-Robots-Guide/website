import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RobotSlot } from './RobotSlot';

// Mock robotGuideData for isolated footnote testing
vi.mock('../../data/robot_guide.json', () => ({
  default: {
    footnotes: [
      "Footnote 1 text",
      "Footnote 2 text"
    ]
  }
}));

describe('RobotSlot Empty State', () => {
  it('renders the empty slot placeholder correctly', () => {
    render(<RobotSlot index={0} onOpenSelector={vi.fn()} onClearSlot={vi.fn()} />);

    expect(screen.getByText('ROBOT SLOT 1')).toBeInTheDocument();
    expect(screen.getByText('Click to select')).toBeInTheDocument();
    expect(screen.getByText('+')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Select robot for slot 1' })).toBeInTheDocument();
  });

  it('calls onOpenSelector when clicked', async () => {
    const user = userEvent.setup();
    const mockOnOpenSelector = vi.fn();
    render(<RobotSlot index={2} onOpenSelector={mockOnOpenSelector} onClearSlot={vi.fn()} />);

    const button = screen.getByRole('button', { name: 'Select robot for slot 3' });
    await user.click(button);

    expect(mockOnOpenSelector).toHaveBeenCalledTimes(1);
    expect(mockOnOpenSelector).toHaveBeenCalledWith(2);
  });

  it('calls onOpenSelector when Enter key is pressed', async () => {
    const user = userEvent.setup();
    const mockOnOpenSelector = vi.fn();
    render(<RobotSlot index={1} onOpenSelector={mockOnOpenSelector} onClearSlot={vi.fn()} />);

    const button = screen.getByRole('button', { name: 'Select robot for slot 2' });
    button.focus();
    await user.keyboard('{Enter}');

    expect(mockOnOpenSelector).toHaveBeenCalledTimes(1);
    expect(mockOnOpenSelector).toHaveBeenCalledWith(1);
  });

  it('calls onOpenSelector when Space key is pressed', async () => {
    const user = userEvent.setup();
    const mockOnOpenSelector = vi.fn();
    render(<RobotSlot index={1} onOpenSelector={mockOnOpenSelector} onClearSlot={vi.fn()} />);

    const button = screen.getByRole('button', { name: 'Select robot for slot 2' });
    button.focus();
    await user.keyboard(' ');

    expect(mockOnOpenSelector).toHaveBeenCalledTimes(1);
    expect(mockOnOpenSelector).toHaveBeenCalledWith(1);
  });
});

describe('RobotSlot Filled State', () => {
  const mockItem = {
    name: 'Cossack',
    value_rating: 3,
    roles: [
      { role: 'Beacon Runner', type: 'primary', footnote: '1' },
      { role: 'Sniper', type: 'secondary' }
    ]
  };

  it('renders the robot details correctly when an item is provided', () => {
    render(<RobotSlot item={mockItem} index={0} onOpenSelector={vi.fn()} onClearSlot={vi.fn()} />);

    expect(screen.getByText('Robot Slot 1')).toBeInTheDocument();
    expect(screen.getByText('Cossack')).toBeInTheDocument();

    // Check for roles
    expect(screen.getByText(/Beacon Runner/)).toBeInTheDocument();
    expect(screen.getByText(/Sniper/)).toBeInTheDocument();

    // Check role types and tooltips
    const primaryRole = screen.getByTitle('Footnote 1 text');
    expect(primaryRole).toHaveClass('role-badge primary');
    expect(primaryRole).toHaveTextContent('Beacon Runner');

    const secondaryRole = screen.getByTitle('');
    expect(secondaryRole).toHaveClass('role-badge secondary');
    expect(secondaryRole).toHaveTextContent('Sniper');

    // Check clear button
    expect(screen.getByTitle('Clear slot')).toBeInTheDocument();
  });

  it('calls onClearSlot when the clear (X) button is clicked', async () => {
    const user = userEvent.setup();
    const mockOnClearSlot = vi.fn();
    render(<RobotSlot item={mockItem} index={3} onOpenSelector={vi.fn()} onClearSlot={mockOnClearSlot} />);

    const clearButton = screen.getByTitle('Clear slot');
    await user.click(clearButton);

    expect(mockOnClearSlot).toHaveBeenCalledTimes(1);
    expect(mockOnClearSlot).toHaveBeenCalledWith(3, expect.any(Object));
  });

  it('renders "No specific roles" when the robot item does not have roles', () => {
    const itemWithoutRoles = {
      name: 'Destrier',
      value_rating: 2
    };
    render(<RobotSlot item={itemWithoutRoles} index={0} onOpenSelector={vi.fn()} onClearSlot={vi.fn()} />);

    expect(screen.getByText('Destrier')).toBeInTheDocument();
    expect(screen.getByText('No specific roles')).toBeInTheDocument();
  });

  it('renders "No specific roles" when the robot item has empty roles array', () => {
    const itemWithEmptyRoles = {
      name: 'Destrier',
      value_rating: 2,
      roles: []
    };
    render(<RobotSlot item={itemWithEmptyRoles} index={0} onOpenSelector={vi.fn()} onClearSlot={vi.fn()} />);

    expect(screen.getByText('Destrier')).toBeInTheDocument();
    expect(screen.getByText('No specific roles')).toBeInTheDocument();
  });
});
