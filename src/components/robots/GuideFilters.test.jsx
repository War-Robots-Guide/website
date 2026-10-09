import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { GuideFilters } from './GuideFilters';
import { VALUE_RATING_RANGES, OVERALL_SCORE_RANGES, STAT_SCORE_RANGES } from './constants';

describe('GuideFilters Component', () => {
  const defaultProps = {
    guideSubTab: 'robots',
    searchInput: '',
    setSearchInput: vi.fn(),
    categoryFilter: 'All',
    setCategoryFilter: vi.fn(),
    availableCategories: ['Tier 4 Robots', 'Tier 3 Robots', 'Ultimate Robots'],
    robotValueFilter: 'All',
    setRobotValueFilter: vi.fn(),
    robotRoleFilter: 'All',
    setRobotRoleFilter: vi.fn(),
    statFilter: 'All',
    setStatFilter: vi.fn(),
    minScoreFilter: 'All',
    setMinScoreFilter: vi.fn(),
    sortBy: 'Default',
    setSortBy: vi.fn()
  };

  it('renders subsectioned Value Rating options instead of individual ratings', () => {
    render(<GuideFilters {...defaultProps} />);
    const valueRatingSelect = screen.getByDisplayValue('All Value Ratings');
    expect(valueRatingSelect).toBeInTheDocument();

    VALUE_RATING_RANGES.forEach(range => {
      expect(within(valueRatingSelect).getByRole('option', { name: range.label })).toBeInTheDocument();
    });
  });

  it('calls setRobotValueFilter when a subsection range is selected', () => {
    const setRobotValueFilter = vi.fn();
    render(<GuideFilters {...defaultProps} setRobotValueFilter={setRobotValueFilter} />);
    const valueRatingSelect = screen.getByDisplayValue('All Value Ratings');

    fireEvent.change(valueRatingSelect, { target: { value: '30-40' } });
    expect(setRobotValueFilter).toHaveBeenCalledWith('30-40');
  });

  it('does not render score filter when statFilter is All', () => {
    render(<GuideFilters {...defaultProps} statFilter="All" />);
    expect(screen.queryByDisplayValue('Any Score')).not.toBeInTheDocument();
  });

  it('renders Overall Score ranges when statFilter is overall', () => {
    render(<GuideFilters {...defaultProps} statFilter="overall" />);
    const scoreSelect = screen.getByDisplayValue('Any Score');
    expect(scoreSelect).toBeInTheDocument();

    OVERALL_SCORE_RANGES.forEach(range => {
      expect(within(scoreSelect).getByRole('option', { name: range.label })).toBeInTheDocument();
    });
  });

  it('renders 0-10 stat score ranges when statFilter is a specific stat like longevity', () => {
    render(<GuideFilters {...defaultProps} statFilter="longevity" />);
    const scoreSelect = screen.getByDisplayValue('Any Score');
    expect(scoreSelect).toBeInTheDocument();

    STAT_SCORE_RANGES.forEach(range => {
      expect(within(scoreSelect).getByRole('option', { name: range.label })).toBeInTheDocument();
    });
  });

  it('resets minScoreFilter to All when statFilter changes', () => {
    const setStatFilter = vi.fn();
    const setMinScoreFilter = vi.fn();
    render(
      <GuideFilters
        {...defaultProps}
        statFilter="All"
        setStatFilter={setStatFilter}
        setMinScoreFilter={setMinScoreFilter}
      />
    );

    const statSelect = screen.getByDisplayValue('All Stats');
    fireEvent.change(statSelect, { target: { value: 'overall' } });

    expect(setStatFilter).toHaveBeenCalledWith('overall');
    expect(setMinScoreFilter).toHaveBeenCalledWith('All');
  });
});
