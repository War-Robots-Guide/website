import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { GuideFilters } from './GuideFilters';
import { VALUE_RATING_RANGES } from './constants';

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

  it('renders streamlined sort options (Default and Value Rating)', () => {
    render(<GuideFilters {...defaultProps} />);
    const sortSelect = screen.getByDisplayValue('Default Sort (by Tier)');
    expect(sortSelect).toBeInTheDocument();
    expect(within(sortSelect).getByRole('option', { name: 'Default Sort (by Tier)' })).toBeInTheDocument();
    expect(within(sortSelect).getByRole('option', { name: 'Sort by Value Rating' })).toBeInTheDocument();
  });

  it('calls setSortBy when sort is changed', () => {
    const setSortBy = vi.fn();
    render(<GuideFilters {...defaultProps} setSortBy={setSortBy} />);
    const sortSelect = screen.getByDisplayValue('Default Sort (by Tier)');

    fireEvent.change(sortSelect, { target: { value: 'value_rating' } });
    expect(setSortBy).toHaveBeenCalledWith('value_rating');
  });
});
