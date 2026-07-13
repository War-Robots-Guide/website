import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AnalysisDashboard } from './AnalysisDashboard';

const MOCK_STATUS_COLORS = {
  MET: { color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', text: 'Met' },
  UNDERFILLED: { color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.1)', text: 'Underfilled' },
  MISSING: { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', text: 'Missing' }
};

const MOCK_CORE_ROLES_CONFIG = [
  { name: 'Support', target: 2, key: 'Support' },
  { name: 'Beacon Runner', target: 1, key: 'Beacon Runner' },
  { name: 'Midrange', target: 2, key: 'Midrange' },
  { name: 'Tank-buster', target: 1, key: 'Tank-buster' }
];

const MOCK_SUPPORT_TARGET = 2;
const MOCK_TANK_BUSTER_TARGET = 1;

vi.mock('../common/ScoreMeter', () => ({
  ScoreMeter: ({ label, score, options }) => (
    <div data-testid="score-meter">
      <span>{label}</span>
      <span>{score}</span>
      <span>{options?.customValueLabel}</span>
      <span data-testid="custom-fill-color">{options?.customFillColor}</span>
    </div>
  )
}));

describe('AnalysisDashboard', () => {
  const defaultProps = {
    hangarAnalysis: {
      scores: {
        'Support': 2.5,
        'Beacon Runner': 1.0,
        'Midrange': 0.5,
        'Tank-buster': 0,
        'Assassin': 1.5,
        'Brawler': 0.5,
        'Sniper': 0
      },
      corePercent: 75,
      alignmentColor: '#fbbf24'
    },
    averageTier: 'S',
    CORE_ROLES_CONFIG: MOCK_CORE_ROLES_CONFIG,
    STATUS_COLORS: MOCK_STATUS_COLORS,
    SUPPORT_TARGET: MOCK_SUPPORT_TARGET,
    TANK_BUSTER_TARGET: MOCK_TANK_BUSTER_TARGET
  };

  it('renders Hangar Roles Profile and Hangar Rating sections', () => {
    render(<AnalysisDashboard {...defaultProps} />);
    expect(screen.getByText('Hangar Roles Profile')).toBeInTheDocument();
    expect(screen.getByText('Hangar Rating')).toBeInTheDocument();
  });

  it('renders the Role Alignment percentage correctly', () => {
    render(<AnalysisDashboard {...defaultProps} />);
    expect(screen.getByText('75%')).toBeInTheDocument();
    expect(screen.getByText('Role Alignment')).toBeInTheDocument();
  });

  it('renders the Average Hangar Tier badge when provided', () => {
    render(<AnalysisDashboard {...defaultProps} />);
    expect(screen.getByText('S', { selector: 'div' })).toBeInTheDocument();
    expect(screen.getByText('Average Hangar Tier')).toBeInTheDocument();
  });

  it('does not render Average Hangar Tier badge if "N/A"', () => {
    render(<AnalysisDashboard {...defaultProps} averageTier="N/A" />);
    expect(screen.queryByText('Average Hangar Tier')).not.toBeInTheDocument();
  });

  it('renders Core Hangar Roles correctly using ScoreMeter mock', () => {
    render(<AnalysisDashboard {...defaultProps} />);

    const scoreMeters = screen.getAllByTestId('score-meter');
    expect(scoreMeters).toHaveLength(MOCK_CORE_ROLES_CONFIG.length);

    // Support: target 2, score 2.5 => MET
    expect(screen.getAllByText('Support').length).toBeGreaterThan(0);
    expect(screen.getByText('2.5 / 2.0')).toBeInTheDocument();

    // Beacon Runner: target 1, score 1.0 => MET
    expect(screen.getAllByText('Beacon Runner').length).toBeGreaterThan(0);
    expect(screen.getByText('1 / 1')).toBeInTheDocument();

    // Midrange: target 2, score 0.5 => UNDERFILLED
    expect(screen.getAllByText('Midrange').length).toBeGreaterThan(0);
    expect(screen.getByText('0.5 / 2.0')).toBeInTheDocument();

    // Tank-buster: target 1, score 0 => MISSING
    expect(screen.getAllByText('Tank-buster').length).toBeGreaterThan(0);
    expect(screen.getAllByText('0 / 1').length).toBeGreaterThan(0);
  });

  it('renders Additional Hangar Roles with correct values', () => {
    render(<AnalysisDashboard {...defaultProps} />);

    expect(screen.getByText('Additional Hangar Roles')).toBeInTheDocument();

    // Assassin score 1.5 => 1.5 / 1.0 (has one)
    expect(screen.getAllByText('Assassin').length).toBeGreaterThan(0);
    expect(screen.getByText('1.5 / 1.0')).toBeInTheDocument();

    // Brawler score 0.5 => 0.5 / 1.0 (has partial)
    expect(screen.getAllByText('Brawler').length).toBeGreaterThan(0);
    expect(screen.getByText('0.5 / 1.0')).toBeInTheDocument();

    // Sniper score 0 => 0 / 1 (missing)
    expect(screen.getAllByText('Sniper').length).toBeGreaterThan(0);
    expect(screen.getAllByText('0 / 1').length).toBeGreaterThan(0);
  });

  it('renders Target Extension Options correctly', () => {
    render(<AnalysisDashboard {...defaultProps} />);

    expect(screen.getByText('Target Extension Options:')).toBeInTheDocument();

    // Support Current: 2.5 / 3.0 (SUPPORT_TARGET + 1)
    expect(screen.getByText((content) => content.includes('Current: 2.5 / 3.0'))).toBeInTheDocument();

    // Tank-buster Current: 0 / 2 (TANK_BUSTER_TARGET + 1)
    expect(screen.getByText((content) => content.includes('Current: 0 / 2'))).toBeInTheDocument();
  });
});
