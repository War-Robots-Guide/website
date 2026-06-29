import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { vi, describe, beforeEach, afterEach, it, expect } from 'vitest';

// Mock child components
vi.mock('./components/common/Header', () => ({
  Header: ({ activeTab, onTabChange, isEasterEggActive }) => (
    <header data-testid="header">
      <span data-testid="active-tab">{activeTab}</span>
      <button onClick={() => onTabChange('robots')}>Go to Robots</button>
      <span data-testid="easter-egg-status">{isEasterEggActive ? 'Active' : 'Inactive'}</span>
    </header>
  )
}));

vi.mock('./components/common/Footer', () => ({
  Footer: ({ onDeveloperClick, onAdazahiClick }) => (
    <footer data-testid="footer">
      <button data-testid="dev-btn" onClick={onDeveloperClick}>Dev Click</button>
      <button data-testid="adazahi-btn" onClick={onAdazahiClick}>Adazahi Click</button>
    </footer>
  )
}));

vi.mock('./components/dashboard/DashboardTab', () => ({
  DashboardTab: ({ onItemClick }) => (
    <div data-testid="dashboard-tab">
      <button onClick={() => onItemClick('Item 1', 'robot', { id: 1 })}>Open Item</button>
    </div>
  )
}));

vi.mock('./components/tiers/TierListTab', () => ({
  TierListTab: () => <div data-testid="tier-list-tab">Tier List</div>
}));

vi.mock('./components/robots/RobotsGuideTab', () => ({
  RobotsGuideTab: () => <div data-testid="robots-guide-tab">Robots Guide</div>
}));

vi.mock('./components/builds/BuildGuidesTab', () => ({
  BuildGuidesTab: () => <div data-testid="build-guides-tab">Build Guides</div>
}));

vi.mock('./components/specializations/SpecializationsTab', () => ({
  SpecializationsTab: () => <div data-testid="specializations-tab">Specializations</div>
}));

vi.mock('./components/pilots/PilotSkillsTab', () => ({
  PilotSkillsTab: () => <div data-testid="pilot-skills-tab">Pilot Skills</div>
}));

vi.mock('./components/weapons/WeaponsDpsTab', () => ({
  WeaponsDpsTab: () => <div data-testid="weapons-dps-tab">Weapons DPS</div>
}));

vi.mock('./components/hangar/HangarAnalyzerTab', () => ({
  HangarAnalyzerTab: () => <div data-testid="hangar-analyzer-tab">Hangar Analyzer</div>
}));

vi.mock('./components/common/DetailModal', () => ({
  DetailModal: ({ selectedItem, onClose }) => (
    <div data-testid="detail-modal">
      <span data-testid="modal-item-name">{selectedItem.name}</span>
      <button data-testid="modal-close-btn" onClick={onClose}>Close</button>
    </div>
  )
}));

describe('App Component', () => {
  beforeEach(() => {
    window.location.hash = ''; // Reset hash
    window.scrollTo = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders dashboard tab by default', async () => {
    render(<App />);
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('dashboard-tab')).toBeInTheDocument();
    expect(screen.getByTestId('active-tab')).toHaveTextContent('dashboard');

    await waitFor(() => {
      expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    });
  });

  it('changes tabs and scrolls to top when hash changes via interaction', async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    });
    window.scrollTo.mockClear();

    // Change tab
    await user.click(screen.getByText('Go to Robots'));

    // Since useHashRouting sets window.location.hash, and jsdom does not trigger hashchange
    // automatically, we trigger it manually
    act(() => {
      window.dispatchEvent(new Event('hashchange'));
    });

    expect(screen.getByTestId('robots-guide-tab')).toBeInTheDocument();
    expect(screen.getByTestId('active-tab')).toHaveTextContent('robots');

    await waitFor(() => {
      expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    });
  });

  it('opens detail modal on item click and closes it', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Click button inside dashboard to open item details
    await user.click(screen.getByText('Open Item'));

    expect(screen.getByTestId('detail-modal')).toBeInTheDocument();
    expect(screen.getByTestId('modal-item-name')).toHaveTextContent('Item 1');

    // Close the modal
    await user.click(screen.getByTestId('modal-close-btn'));
    expect(screen.queryByTestId('detail-modal')).not.toBeInTheDocument();
  });

  it('clears selectedItem when tab changes', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Open modal
    await user.click(screen.getByText('Open Item'));
    expect(screen.getByTestId('detail-modal')).toBeInTheDocument();

    // Change tab
    await user.click(screen.getByText('Go to Robots'));
    act(() => {
      window.dispatchEvent(new Event('hashchange'));
    });

    // Modal should be gone
    expect(screen.queryByTestId('detail-modal')).not.toBeInTheDocument();
  });

  it('activates easter egg when developer click is triggered 4 times', async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(screen.getByTestId('easter-egg-status')).toHaveTextContent('Inactive');
    expect(document.body.style.background).toBe('');

    const devBtn = screen.getByTestId('dev-btn');

    // Click 3 times
    for (let i = 0; i < 3; i++) {
      await user.click(devBtn);
    }

    expect(screen.getByTestId('easter-egg-status')).toHaveTextContent('Inactive');
    expect(document.body.style.background).toBe('');

    // Click 4th time
    await user.click(devBtn);

    expect(screen.getByTestId('easter-egg-status')).toHaveTextContent('Active');
    expect(document.body.style.background).toBe('rgb(7, 8, 12)'); // '#07080c' converts to rgb in jsdom
  });

  it('activates Adazahi easter egg when Adazahi name click is triggered 8 times', async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(screen.getByTestId('easter-egg-status')).toHaveTextContent('Inactive');
    expect(document.body.style.background).toBe('');

    const adazahiBtn = screen.getByTestId('adazahi-btn');

    // Click 7 times
    for (let i = 0; i < 7; i++) {
      await user.click(adazahiBtn);
    }

    expect(screen.getByTestId('easter-egg-status')).toHaveTextContent('Inactive');
    expect(document.body.style.background).toBe('');

    // Click 8th time
    await user.click(adazahiBtn);

    expect(screen.getByTestId('easter-egg-status')).toHaveTextContent('Active');
    expect(document.body.style.background).toBe('rgb(7, 8, 12)'); // '#07080c' converts to rgb in jsdom
  });
});
