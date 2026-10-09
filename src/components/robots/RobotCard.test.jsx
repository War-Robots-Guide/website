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

  const mockGuideData = {
    footnotes: ['Special ability description']
  };

  it('renders robot details correctly', () => {
    const onClickMock = vi.fn();
    render(<RobotCard robot={mockRobot} onClick={onClickMock} robotGuideData={mockGuideData} />);

    // Basic details
    expect(screen.getByText('Test Robot')).toBeInTheDocument();
    expect(screen.getByText('Test Sheet')).toBeInTheDocument();
    expect(screen.getByText('VALUE RATING')).toBeInTheDocument();
    expect(screen.getByText('A highly tested robot.')).toBeInTheDocument();

    // Roles and badges
    expect(screen.getByText('Brawler (Primary)')).toBeInTheDocument();
    expect(screen.getByText('Support (Secondary)')).toBeInTheDocument();

    // Verify footnote tooltip
    const brawlerBadge = screen.getByText('Brawler (Primary)');
    expect(brawlerBadge).toHaveAttribute('title', 'Special ability description');

    // Support has no footnote, title should be empty
    const supportBadge = screen.getByText('Support (Secondary)');
    expect(supportBadge).toHaveAttribute('title', '');
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
    expect(onClickMock).toHaveBeenCalledWith(mockRobot, 'Robots');
  });

  it('handles keyboard interaction (Space)', () => {
    const onClickMock = vi.fn();
    render(<RobotCard robot={mockRobot} onClick={onClickMock} />);

    const card = screen.getByRole('button', { name: `View details for Test Robot` });
    fireEvent.keyDown(card, { key: ' ', code: 'Space', charCode: 32 });

    expect(onClickMock).toHaveBeenCalledTimes(1);
    expect(onClickMock).toHaveBeenCalledWith(mockRobot, 'Robots');
  });

  it('renders gracefully when roles are missing', () => {
    const robotWithoutRoles = { ...mockRobot, roles: undefined };
    const onClickMock = vi.fn();
    render(<RobotCard robot={robotWithoutRoles} onClick={onClickMock} />);

    expect(screen.getByText('Test Robot')).toBeInTheDocument();
    // No roles should be rendered
    expect(screen.queryByText(/Primary/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Secondary/)).not.toBeInTheDocument();
  });

  it('handles missing footnote in guide data gracefully', () => {
    const onClickMock = vi.fn();
    // mockGuideData is undefined here
    render(<RobotCard robot={mockRobot} onClick={onClickMock} />);

    const brawlerBadge = screen.getByText('Brawler (Primary)');
    // Falls back to footnote ID '1' since guide data isn't available
    expect(brawlerBadge).toHaveAttribute('title', '1');
  });

  it('renders asterisk footnote labels and explanatory text accurately', () => {
    const asteriskRobot = {
      ...mockRobot,
      roles: [
        { role: 'Brawler', type: 'primary', footnote: '***' },
        { role: 'Support', type: 'secondary', footnote: '***' }
      ]
    };
    const guideDataWithFootnotes = {
      footnotes: [
        '*Only with Traditionalist pilot skill',
        '***Only with Lock-down Ammo module or Paralysis drone'
      ]
    };

    render(<RobotCard robot={asteriskRobot} onClick={vi.fn()} robotGuideData={guideDataWithFootnotes} />);

    expect(screen.getByText('*** Only with Lock-down Ammo module or Paralysis drone')).toBeInTheDocument();
  });

  it('renders Overall Score bar scaled out of 50', () => {
    const { container } = render(<RobotCard robot={mockRobot} onClick={vi.fn()} />);

    // mockRobot.scores.overall is 4, so out of 50 it should be (4/50)*100 = 8%
    const scoreWrappers = container.querySelectorAll('.score-bar-wrapper');
    const overallWrapper = Array.from(scoreWrappers).find(w => w.textContent.includes('Overall Score'));
    expect(overallWrapper).toBeDefined();

    const fillElement = overallWrapper.querySelector('.score-fill');
    expect(fillElement).toHaveStyle({ width: '8%' });
  });
});
