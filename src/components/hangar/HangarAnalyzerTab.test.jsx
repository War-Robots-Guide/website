import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { HangarAnalyzerTab } from './HangarAnalyzerTab';
import * as tierLookup from '../../utils/tierLookup';

// Mock the child components to simplify testing, except the Selector Modal which is crucial to interaction
vi.mock('../common/RatingBar', () => ({
  RatingBar: ({ rating }) => <div data-testid="rating-bar">{rating}</div>
}));

vi.mock('../common/ScoreMeter', () => ({
  ScoreMeter: ({ label, score }) => <div data-testid="score-meter">{label}: {score}</div>
}));

// Mock the robot data
vi.mock('../../data/robot_guide.json', () => ({
  default: {
    robots: [
      {
        name: 'MockBrawler',
        value_rating: 4,
        roles: [{ role: 'Brawler', type: 'primary' }, { role: 'Tank-buster', type: 'secondary' }]
      },
      {
        name: 'MockSupport',
        value_rating: 3,
        roles: [{ role: 'Support', type: 'primary' }]
      }
    ],
    titans: [
      {
        name: 'MockTitan',
        value_rating: 5
      }
    ]
  }
}));

// Mock tier lookup
vi.spyOn(tierLookup, 'getTierForName').mockImplementation((name) => {
  if (name === 'MockBrawler') return 'S';
  if (name === 'MockSupport') return 'A';
  if (name === 'MockTitan') return 'X';
  return null;
});

describe('HangarAnalyzerTab', () => {
  let user;

  beforeEach(() => {
    user = userEvent.setup();
    vi.clearAllMocks();
  });

  it('renders initial state with empty slots', () => {
    render(<HangarAnalyzerTab />);

    // 5 empty robot slots
    expect(screen.getAllByText(/ROBOT SLOT/i)).toHaveLength(5);

    // 1 empty titan slot
    expect(screen.getByText('TITAN SLOT')).toBeInTheDocument();

    // Dashboard should be hidden
    expect(screen.getByText(/Fill out the hangar analyzer above/i)).toBeInTheDocument();
  });

  it('can open selector and select a robot', async () => {
    render(<HangarAnalyzerTab />);

    // Click the first robot slot
    const robotSlots = screen.getAllByRole('button', { name: /Select robot for slot/i });
    await user.click(robotSlots[0]);

    // Modal should appear
    expect(screen.getByText('Select Robot for Slot 1')).toBeInTheDocument();

    // Select the MockBrawler
    const brawlerOption = screen.getByText('MockBrawler');
    await user.click(brawlerOption);

    // Modal should close and the robot should be in the slot
    expect(screen.queryByText('Select Robot for Slot 1')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'MockBrawler' })).toBeInTheDocument();

    // The analysis dashboard should now be visible
    expect(screen.getByText('Hangar Roles Profile')).toBeInTheDocument();
  });

  it('can open selector and select a titan', async () => {
    render(<HangarAnalyzerTab />);

    // Click the titan slot
    const titanSlot = screen.getByRole('button', { name: /Select Titan/i });
    await user.click(titanSlot);

    // Modal should appear
    expect(screen.getByText('Select Titan')).toBeInTheDocument();

    // Select the MockTitan
    const titanOption = screen.getByText('MockTitan');
    await user.click(titanOption);

    // Modal should close and titan should be in the slot
    expect(screen.queryByText('Select Titan')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'MockTitan' })).toBeInTheDocument();
  });

  it('can clear a selected slot', async () => {
    render(<HangarAnalyzerTab />);

    // Add a robot
    const robotSlots = screen.getAllByRole('button', { name: /Select robot for slot/i });
    await user.click(robotSlots[0]);
    await user.click(screen.getByText('MockBrawler'));

    // Verify it was added
    expect(screen.getByRole('heading', { name: 'MockBrawler' })).toBeInTheDocument();

    // Click the clear button
    const clearButton = screen.getByTitle('Clear slot');
    await user.click(clearButton);

    // Verify it was removed
    expect(screen.queryByRole('heading', { name: 'MockBrawler' })).not.toBeInTheDocument();

    // The dashboard should be hidden again
    expect(screen.getByText(/Fill out the hangar analyzer above/i)).toBeInTheDocument();
  });

  it('calculates average tier and roles correctly', async () => {
    render(<HangarAnalyzerTab />);

    // Add MockBrawler (Tier S = 8)
    const slots = screen.getAllByRole('button', { name: /Select robot for slot/i });
    await user.click(slots[0]);
    await user.click(screen.getByText('MockBrawler'));

    // Add MockSupport (Tier A = 7)
    const remainingSlots = screen.getAllByRole('button', { name: /Select robot for slot/i });
    await user.click(remainingSlots[0]); // first available empty slot
    await user.click(screen.getByText('MockSupport'));

    // Add MockTitan (Tier X = 9)
    await user.click(screen.getByRole('button', { name: /Select Titan/i }));
    await user.click(screen.getByText('MockTitan'));

    // Average tier: (8 + 7 + 9) / 3 = 24 / 3 = 8 (which is 'S')
    // The average tier badge should display 'S'
    expect(screen.getByText('Average Hangar Tier')).toBeInTheDocument();
    // In the component, the tier letter is rendered inside a large circle above the "Average Hangar Tier" text
    expect(screen.getByText('S', { selector: 'div' })).toBeInTheDocument();

    // Check role calculations
    // MockBrawler has primary Brawler (1.0), secondary Tank-buster (0.5)
    // MockSupport has primary Support (1.0)
    expect(screen.getAllByText('Brawler').length).toBeGreaterThan(0);
    expect(screen.getAllByText('1.0', { selector: 'span' }).length).toBeGreaterThan(0);

    expect(screen.getAllByText('Tank-buster').length).toBeGreaterThan(0);
    expect(screen.getAllByText('0.5', { selector: 'span' }).length).toBeGreaterThan(0);

    expect(screen.getAllByText('Support').length).toBeGreaterThan(0);
    // Support will have '1.0' badge as well
    // Let's check ScoreMeters to verify core role met count
    const scoreMeters = screen.getAllByTestId('score-meter');
    expect(scoreMeters.some(el => el.textContent.includes('Support: 1'))).toBe(true);
    expect(scoreMeters.some(el => el.textContent.includes('Tank-buster: 0.5'))).toBe(true);
  });
});
