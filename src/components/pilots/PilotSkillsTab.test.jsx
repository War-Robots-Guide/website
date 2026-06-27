import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PilotSkillsTab } from './PilotSkillsTab';

// Mock pilots data
vi.mock('../../data/pilots.json', () => ({
  default: {
    robots: {
      "Must Use": [
        { name: "Mechanic", description: "Robot mechanic description." }
      ],
      "Usually Use": [
        { name: "Armor Expert", description: "Robot armor expert description." }
      ],
      "Sometimes Use": [],
      "Don't Use": [
        { name: "Ghost", description: "Robot ghost description." }
      ]
    },
    titans: {
      "Must Use": [
        { name: "Titan Mechanic", description: "Titan mechanic description." }
      ],
      "Usually Use": [],
      "Sometimes Use": [
        { name: "Tough Guy", description: "Titan tough guy description." }
      ],
      "Don't Use": []
    }
  }
}));

describe('PilotSkillsTab', () => {
  it('renders the initial state with Robot Pilots tab active', () => {
    render(<PilotSkillsTab />);

    // Hero banner text
    expect(screen.getByText('Pilot Skills Directory')).toBeInTheDocument();

    // Check if tabs are present
    const robotTab = screen.getByText('Robot Pilots');
    const titanTab = screen.getByText('Titan Pilots');
    expect(robotTab).toBeInTheDocument();
    expect(robotTab).toHaveClass('active');
    expect(titanTab).toBeInTheDocument();
    expect(titanTab).not.toHaveClass('active');

    // Check if robot skills are rendered
    expect(screen.getByText('Must Use')).toBeInTheDocument();
    expect(screen.getByText('Mechanic')).toBeInTheDocument();
    expect(screen.getByText('Robot mechanic description.')).toBeInTheDocument();

    expect(screen.getByText('Usually Use')).toBeInTheDocument();
    expect(screen.getByText('Armor Expert')).toBeInTheDocument();

    expect(screen.getByText("Don't Use")).toBeInTheDocument();
    expect(screen.getByText('Ghost')).toBeInTheDocument();

    // Ensure empty category is not rendered
    expect(screen.queryByText('Sometimes Use')).not.toBeInTheDocument();

    // Ensure titan skills are not rendered yet
    expect(screen.queryByText('Titan Mechanic')).not.toBeInTheDocument();
  });

  it('switches to Titan Pilots tab when clicked', () => {
    render(<PilotSkillsTab />);

    const titanTab = screen.getByText('Titan Pilots');
    fireEvent.click(titanTab);

    expect(titanTab).toHaveClass('active');
    const robotTab = screen.getByText('Robot Pilots');
    expect(robotTab).not.toHaveClass('active');

    // Check if titan skills are rendered
    expect(screen.getByText('Must Use')).toBeInTheDocument();
    expect(screen.getByText('Titan Mechanic')).toBeInTheDocument();
    expect(screen.getByText('Titan mechanic description.')).toBeInTheDocument();

    expect(screen.getByText('Sometimes Use')).toBeInTheDocument();
    expect(screen.getByText('Tough Guy')).toBeInTheDocument();

    // Ensure empty categories are not rendered
    expect(screen.queryByText('Usually Use')).not.toBeInTheDocument();
    expect(screen.queryByText("Don't Use")).not.toBeInTheDocument();

    // Ensure robot skills are not rendered anymore
    expect(screen.queryByText('Mechanic')).not.toBeInTheDocument();
    expect(screen.queryByText('Armor Expert')).not.toBeInTheDocument();
    expect(screen.queryByText('Ghost')).not.toBeInTheDocument();
  });
});
