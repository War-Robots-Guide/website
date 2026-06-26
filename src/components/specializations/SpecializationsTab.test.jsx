import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SpecializationsTab } from './SpecializationsTab';

// Mock specializations data with empty intro
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
    render(<SpecializationsTab />);
    
    // Header should still render
    expect(screen.getByText('Module Specialization Guide')).toBeInTheDocument();
    
    // Interactive Assistant title should render
    expect(screen.getByText('Automatic Specialization Picker')).toBeInTheDocument();
    
    // Specialization cards should render
    expect(screen.getByText('Damage Dealer/Raider')).toBeInTheDocument();
    expect(screen.getByText('Robot damage dealer description')).toBeInTheDocument();
  });
});
