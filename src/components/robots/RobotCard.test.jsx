import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { RobotCard } from './RobotCard';

describe('RobotCard', () => {
  const mockRobot = {
    name: 'Test Robot',
    sheet: 'Test Sheet',
    value_rating: 4,
    comments: 'A highly tested robot.',
    scores: {
      longevity: 3,
      lethality: 4,
      mobility: 5,
      utility: 2,
      accessibility: 1,
      overall: 4
    },
    roles: [
      { role: 'Brawler', type: 'primary', footnote: '1' },
      { role: 'Support', type: 'secondary' }
    ]
  };

  it('renders robot details correctly as an image card', () => {
    const onClickMock = vi.fn();
    render(<RobotCard robot={mockRobot} onClick={onClickMock} />);

    // Basic details
    expect(screen.getByText('Test Robot')).toBeInTheDocument();
    expect(screen.getByText('Test Sheet')).toBeInTheDocument();
    expect(screen.getByText('VALUE RATING')).toBeInTheDocument();
    expect(screen.getByText('A highly tested robot.')).toBeInTheDocument();
  });

  it('handles click interaction', () => {
    const onClickMock = vi.fn();
    render(<RobotCard robot={mockRobot} onClick={onClickMock} />);

    const card = screen.getByRole('button', { name: `View details for Test Robot` });
    fireEvent.click(card);

    expect(onClickMock).toHaveBeenCalledTimes(1);
    expect(onClickMock).toHaveBeenCalledWith(mockRobot, 'Robots');
  });

  it('handles keyboard interaction (Enter)', () => {
    const onClickMock = vi.fn();
    render(<RobotCard robot={mockRobot} onClick={onClickMock} />);

    const card = screen.getByRole('button', { name: `View details for Test Robot` });
    fireEvent.keyDown(card, { key: 'Enter', code: 'Enter', charCode: 13 });

    expect(onClickMock).toHaveBeenCalledTimes(1);
  });
});
