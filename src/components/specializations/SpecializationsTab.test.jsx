import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SpecializationsTab } from './SpecializationsTab';

// Mock specializations data
vi.mock('../../data/specializations.json', () => ({
  default: {
    intro: '',
    sections: [
      {
        title: 'Damage Dealer/Raider (Robot)',
        description: 'Robot damage dealer description',
        slots: [
          { name: 'First slot', content: 'Slot content 1' }
        ]
      }
    ]
  }
}));

describe('SpecializationsTab', () => {
  it('renders successfully without the intro text section', () => {
    render(<SpecializationsTab onItemClick={() => {}} />);
    
    // Header should still render
    expect(screen.getByText('Specializations Guide')).toBeInTheDocument();
    
    // Interactive Assistant title should render
    expect(screen.getByText('Automatic Specialization Picker')).toBeInTheDocument();
    
    // Specialization cards should render
    expect(screen.getByText('Damage Dealer/Raider')).toBeInTheDocument();
    expect(screen.getByText('Robot damage dealer description')).toBeInTheDocument();
  });

  it('calls onItemClick when a specialization card is clicked', () => {
    const mockOnItemClick = vi.fn();
    render(<SpecializationsTab onItemClick={mockOnItemClick} />);
    
    const card = screen.getByRole('button', { name: /View details for Damage Dealer\/Raider/i });
    expect(card).toBeInTheDocument();
    
    fireEvent.click(card);
    
    expect(mockOnItemClick).toHaveBeenCalledWith(
      'Damage Dealer/Raider',
      'Specialization',
      {
        description: 'Robot damage dealer description',
        slots: [
          { name: 'First slot', content: 'Slot content 1' }
        ],
        isTitan: false
      }
    );
  });
});

