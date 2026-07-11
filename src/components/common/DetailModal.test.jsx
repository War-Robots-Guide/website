import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DetailModal } from './DetailModal';

// Mock the imported JSON data to ensure predictable, isolated tests
vi.mock('../../data/weapons_dps.json', () => ({
  default: {
    'Alpha Weapons': [
      {
        name: 'Cryo',
        burst_dps: '1000',
        cycle_dps: '500',
        range: '300m',
        notes: 'Test notes'
      }
    ]
  }
}));

vi.mock('../../data/robot_guide.json', () => ({
  default: {
    robots: [
      {
        name: 'Destrier',
        value_rating: 3,
        roles: [{ type: 'beacon', role: 'Beacon Runner' }],
        scores: {
          longevity: 2,
          lethality: 3,
          mobility: 4,
          utility: 1,
          accessibility: 5,
          overall: 3
        }
      }
    ],
    titans: [
      {
        name: 'Arthur',
        value_rating: 2,
        roles: [{ type: 'brawler', role: 'Brawler' }],
        scores: {
          longevity: 4,
          lethality: 3,
          mobility: 1,
          utility: 2,
          accessibility: 5,
          overall: 3
        }
      }
    ]
  }
}));

describe('DetailModal Component', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  it('returns null when selectedItem is falsy', () => {
    const { container } = render(<DetailModal selectedItem={null} onClose={mockOnClose} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders a Weapon type with correct information', () => {
    const selectedItem = {
      type: 'Weapons',
      name: 'Cryo',
      data: {
        description: 'Freezes enemies.'
      }
    };

    render(<DetailModal selectedItem={selectedItem} onClose={mockOnClose} />);

    expect(screen.getAllByText('Cryo').length).toBeGreaterThan(0);
    expect(screen.getByText('Weapons')).toBeInTheDocument();
    expect(screen.getByText('Freezes enemies.')).toBeInTheDocument();

    // DPS info
    expect(screen.getByText('1,000')).toBeInTheDocument(); // BURST DPS
    expect(screen.getByText('500')).toBeInTheDocument(); // CYCLE DPS
    expect(screen.getByText('300m')).toBeInTheDocument(); // RANGE
    expect(screen.getByText('Test notes')).toBeInTheDocument(); // NOTES
  });

  it('renders a Robot type with correct information', () => {
    const selectedItem = {
      type: 'Robots',
      name: 'Destrier',
      data: {
        description: 'Starter robot.'
      }
    };

    render(<DetailModal selectedItem={selectedItem} onClose={mockOnClose} />);

    expect(screen.getByText('Destrier')).toBeInTheDocument();
    expect(screen.getByText('Robots')).toBeInTheDocument();
    expect(screen.getByText('Starter robot.')).toBeInTheDocument();

    // Role
    expect(screen.getByText('Beacon Runner')).toBeInTheDocument();
    // Verify some score labels are present
    expect(screen.getByText('Longevity')).toBeInTheDocument();
    expect(screen.getByText('Lethality')).toBeInTheDocument();
  });

  it('renders a Titan type with correct information', () => {
    const selectedItem = {
      type: 'Titans',
      name: 'Arthur',
      data: {
        description: 'A slow titan.'
      }
    };

    render(<DetailModal selectedItem={selectedItem} onClose={mockOnClose} />);

    expect(screen.getByText('Arthur')).toBeInTheDocument();
    expect(screen.getByText('Titans')).toBeInTheDocument();
    expect(screen.getByText('A slow titan.')).toBeInTheDocument();

    // Role
    expect(screen.getByText('Brawler')).toBeInTheDocument();
  });

  it('renders a Specialization type with correct information', () => {
    const selectedItem = {
      type: 'Specialization',
      name: 'Speedster',
      data: {
        description: 'Run fast.',
        isTitan: false,
        slots: [
          { name: 'Slot 1', content: 'Speed Boost' },
          { name: 'Slot 2', content: 'Jump Module' }
        ]
      }
    };

    render(<DetailModal selectedItem={selectedItem} onClose={mockOnClose} />);

    expect(screen.getByText('Speedster')).toBeInTheDocument();
    expect(screen.getByText('Robot Specialization')).toBeInTheDocument();
    expect(screen.getByText('Run fast.')).toBeInTheDocument();

    expect(screen.getByText('Slot 1')).toBeInTheDocument();
    expect(screen.getByText('Speed Boost')).toBeInTheDocument();
    expect(screen.getByText('Slot 2')).toBeInTheDocument();
    expect(screen.getByText('Jump Module')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const selectedItem = { type: 'Robots', name: 'Destrier', data: { description: 'test' } };
    render(<DetailModal selectedItem={selectedItem} onClose={mockOnClose} />);

    const closeButton = screen.getByRole('button', { name: /close modal/i });
    fireEvent.click(closeButton);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when overlay is clicked', () => {
    const selectedItem = { type: 'Robots', name: 'Destrier', data: { description: 'test' } };
    render(<DetailModal selectedItem={selectedItem} onClose={mockOnClose} />);

    const overlay = screen.getByRole('dialog');
    fireEvent.click(overlay);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when modal content is clicked', () => {
    const selectedItem = { type: 'Robots', name: 'Destrier', data: { description: 'test' } };
    render(<DetailModal selectedItem={selectedItem} onClose={mockOnClose} />);

    const content = screen.getByText('Destrier');
    fireEvent.click(content);
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('calls onClose when Escape key is pressed', () => {
    const selectedItem = { type: 'Robots', name: 'Destrier', data: { description: 'test' } };
    render(<DetailModal selectedItem={selectedItem} onClose={mockOnClose} />);

    fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when other keys are pressed', () => {
    const selectedItem = { type: 'Robots', name: 'Destrier', data: { description: 'test' } };
    render(<DetailModal selectedItem={selectedItem} onClose={mockOnClose} />);

    fireEvent.keyDown(window, { key: 'Enter', code: 'Enter' });
    expect(mockOnClose).not.toHaveBeenCalled();
  });
});
