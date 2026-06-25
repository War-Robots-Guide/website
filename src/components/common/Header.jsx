import { Shield, Compass, Award, Layers, UserCheck, BarChart2, Zap, Wrench } from 'lucide-react';

export function Header({ activeTab, onTabChange }) {
  return (
    <header className="header">
      <div className="header-content">
        <button 
          className="logo-container" 
          onClick={() => onTabChange('dashboard')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Shield size={24} className="logo-icon" />
          <span className="logo-text">War Robots Guide</span>
        </button>
        
        <nav className="nav-links">
          <button className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => onTabChange('dashboard')}>
            <Compass size={16} /> Home
          </button>
          <button className={`nav-item ${activeTab === 'tiers' ? 'active' : ''}`} onClick={() => onTabChange('tiers')}>
            <Award size={16} /> Tier Lists
          </button>
          <button className={`nav-item ${activeTab === 'robots' ? 'active' : ''}`} onClick={() => onTabChange('robots')}>
            <Shield size={16} /> Value Ratings
          </button>
          <button className={`nav-item ${activeTab === 'builds' ? 'active' : ''}`} onClick={() => onTabChange('builds')}>
            <Wrench size={16} /> Build Guides
          </button>
          <button className={`nav-item ${activeTab === 'specializations' ? 'active' : ''}`} onClick={() => onTabChange('specializations')}>
            <Layers size={16} /> Specializations
          </button>
          <button className={`nav-item ${activeTab === 'pilots' ? 'active' : ''}`} onClick={() => onTabChange('pilots')}>
            <UserCheck size={16} /> Pilot Skills
          </button>
          <button className={`nav-item ${activeTab === 'weapons' ? 'active' : ''}`} onClick={() => onTabChange('weapons')}>
            <BarChart2 size={16} /> Weapon DPS
          </button>
          <button className={`nav-item ${activeTab === 'hangar' ? 'active' : ''}`} onClick={() => onTabChange('hangar')}>
            <Zap size={16} /> Hangar Analyzer
          </button>
        </nav>
      </div>
    </header>
  );
}
