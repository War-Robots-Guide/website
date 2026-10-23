import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { RobotsGuideTab } from './RobotsGuideTab';

vi.mock('../../data/robot_guide.json', () => ({ default: {
  methodology: ['READ ME', 'Read me content.', 'METHODOLOGY', 'All five factors count.'],
  robots: [
    { name: 'Ravana', sheet: 'Tier 4 Robots', value_rating: 34, comments: 'Brawler robot.', roles: [{ role: 'Brawler', type: 'main' }] },
    { name: 'Destrier', sheet: 'Tier 3 Robots', value_rating: 12, comments: 'Ravana-like introductory robot.', roles: [] },
    { name: 'UE Raven', sheet: 'Ultimate Robots', value_rating: 30, comments: 'Ultimate robot.', roles: [{ role: 'Beacon Runner', type: 'main' }] },
  ],
  titans: [{ name: 'UE Ao Ming', value_rating: 22, comments: 'Ultimate titan.', roles: [] }, { name: 'Kid', value_rating: 14, comments: 'Starter titan.', roles: [] }, { name: 'Luchador', value_rating: 19, comments: 'Titan comments.', roles: [{ role: 'Brawler', type: 'main' }] }],
} }));

describe('Value rating tier list', () => {
  it('groups every robot by value score and shows only score and main role on portraits', () => {
    render(<RobotsGuideTab />);
    expect(within(screen.getByRole('region', { name: 'Good value ratings' })).getByText('Ravana')).toBeInTheDocument();
    expect(within(screen.getByRole('region', { name: 'Fair value ratings' })).getByText('UE Raven')).toBeInTheDocument();
    expect(within(screen.getByRole('region', { name: 'Bad value ratings' })).getByText('Destrier')).toBeInTheDocument();
    expect(screen.getByLabelText('Value rating 34')).toBeInTheDocument();
    expect(screen.getByTitle('Main role: Brawler')).toBeInTheDocument();
    expect(screen.queryByText('Attribute ratings')).not.toBeInTheDocument();
  });
  it('searches names and comments', () => {
    render(<RobotsGuideTab />);
    fireEvent.change(screen.getByPlaceholderText('Search robots...'), { target: { value: 'Ravana' } });
    expect(screen.getByText('Ravana')).toBeInTheDocument();
    expect(screen.getByText('Destrier')).toBeInTheDocument();
    expect(screen.queryByText('UE Raven')).not.toBeInTheDocument();
  });
  it('keeps robot type, value band and role filters', () => {
    render(<RobotsGuideTab />);
    fireEvent.change(screen.getByLabelText('Filter by robot type'), { target: { value: 'Ultimate Robots' } });
    expect(screen.getByText('UE Raven')).toBeInTheDocument();
    expect(screen.queryByText('Ravana')).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Filter by robot type'), { target: { value: 'All' } });
    fireEvent.change(screen.getByLabelText('Filter by value rating'), { target: { value: '3' } });
    expect(screen.getByText('Ravana')).toBeInTheDocument();
    expect(screen.queryByText('UE Raven')).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Filter by value rating'), { target: { value: 'All' } });
    fireEvent.change(screen.getByLabelText('Filter by role'), { target: { value: 'Beacon Runner' } });
    expect(screen.getByText('UE Raven')).toBeInTheDocument();
    expect(screen.queryByText('Ravana')).not.toBeInTheDocument();
  });
  it('switches to titans, resets filters and opens value details', () => {
    const onItemClick = vi.fn();
    render(<RobotsGuideTab onItemClick={onItemClick} />);
    fireEvent.click(screen.getByRole('button', { name: 'Titans', exact: true }));
    fireEvent.click(screen.getByRole('button', { name: 'View details for Luchador' }));
    expect(onItemClick).toHaveBeenCalledWith('Luchador', 'Titans', { description: 'Titan comments.' });
    expect(screen.queryByText('Ravana')).not.toBeInTheDocument();
  });
  it('includes the full read me and methodology in the dropdown', () => {
    render(<RobotsGuideTab />);
    fireEvent.click(screen.getByText('Methodology', { exact: true }));
    expect(screen.getByText('Read me content.')).toBeVisible();
    expect(screen.getByText('All five factors count.')).toBeVisible();
  });
  it('filters titans by type and resets the filter on category changes', () => {
    render(<RobotsGuideTab />);
    fireEvent.click(screen.getByRole('button', { name: 'Titans', exact: true }));
    fireEvent.change(screen.getByLabelText('Filter by titan type'), { target: { value: 'Ultimate Titans' } });
    expect(screen.getByText('UE Ao Ming')).toBeInTheDocument();
    expect(screen.queryByText('Luchador')).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Filter by titan type'), { target: { value: 'Tier 1 Titans' } });
    expect(screen.getByText('Kid')).toBeInTheDocument();
    expect(screen.queryByText('UE Ao Ming')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Robots', exact: true }));
    expect(screen.getByText('Ravana')).toBeInTheDocument();
  });

});
