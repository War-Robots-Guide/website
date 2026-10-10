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
          { name: 'First slot', content: 'Slot content with Nuclear Amplifier' }
        ]
      }
    ]
  }
}));

describe('SpecializationsTab', () => {
  it('renders Automatic Specialization Picker as primary view', () => {
    render(<SpecializationsTab onItemClick={() => {}} />);
    
    // Header should render
    expect(screen.getByText('Specializations Guide')).toBeInTheDocument();
    
    // Automatic Specialization Picker should be primary view
    expect(screen.getByText('Automatic Specialization Picker')).toBeInTheDocument();

    // Tab pills should be visible
    expect(screen.getByText('Specialization Picker')).toBeInTheDocument();
    expect(screen.getByText('More Details')).toBeInTheDocument();
  });

  it('switches to More Details tab and renders specialization cards', () => {
    const mockOnItemClick = vi.fn();
    render(<SpecializationsTab onItemClick={mockOnItemClick} />);

    // Click More Details tab pill
    fireEvent.click(screen.getByText('More Details'));

    // Specialization card should now be rendered
    expect(screen.getByText('Damage Dealer/Raider')).toBeInTheDocument();
    expect(screen.getByText('Robot damage dealer description')).toBeInTheDocument();

    // Click the card
    const card = screen.getByRole('button', { name: /View details for Damage Dealer\/Raider/i });
    expect(card).toBeInTheDocument();
    
    fireEvent.click(card);

    expect(mockOnItemClick).toHaveBeenCalledWith(
      'Damage Dealer/Raider',
      'Specialization',
      {
        description: 'Robot damage dealer description',
        slots: [
          { name: 'First slot', content: 'Slot content with Nuclear Amplifier' }
        ],
        isTitan: false
      }
    );
  });
});
