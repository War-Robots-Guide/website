export function Header({ activeTab, onTabChange, isEasterEggActive }) {
  return (
    <header 
      className="header"
      style={isEasterEggActive ? { 
        background: 'rgba(7, 8, 12, 0.35)', 
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)' 
      } : {}}
    >
      <div className="header-content">
        <button 
          className="logo-container" 
          onClick={() => onTabChange('dashboard')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <img src="/WRGICON.png" alt="War Robots Guide Logo" className="logo-img" />
          <span className="logo-text">War Robots Guide</span>
        </button>
        
        <nav className="nav-links">
          <button className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => onTabChange('dashboard')}>
            <img src="/icons/ship_gold.png" alt="" className="nav-icon" /> Home
          </button>
          <button className={`nav-item ${activeTab === 'tiers' ? 'active' : ''}`} onClick={() => onTabChange('tiers')}>
            <img src="/icons/hint_operation.png" alt="" className="nav-icon" /> Tier Lists
          </button>
          <button className={`nav-item ${activeTab === 'robots' ? 'active' : ''}`} onClick={() => onTabChange('robots')}>
            <img src="/icons/actions_orange.png" alt="" className="nav-icon" /> Value Ratings
          </button>
          <button className={`nav-item ${activeTab === 'builds' ? 'active' : ''}`} onClick={() => onTabChange('builds')}>
            <img src="/icons/drone_gold.png" alt="" className="nav-icon" /> Build Guides
          </button>
          <button className={`nav-item ${activeTab === 'specializations' ? 'active' : ''}`} onClick={() => onTabChange('specializations')}>
            <img src="/icons/module_old_gold.png" alt="" className="nav-icon" /> Specializations
          </button>
          <button className={`nav-item ${activeTab === 'pilots' ? 'active' : ''}`} onClick={() => onTabChange('pilots')}>
            <img src="/icons/pilot_gold.png" alt="" className="nav-icon" /> Pilot Skills
          </button>
          <button className={`nav-item ${activeTab === 'weapons' ? 'active' : ''}`} onClick={() => onTabChange('weapons')}>
            <img src="/icons/weapon_gold.png" alt="" className="nav-icon" /> Weapon DPS
          </button>
          <button className={`nav-item ${activeTab === 'hangar' ? 'active' : ''}`} onClick={() => onTabChange('hangar')}>
            <img src="/icons/microchip_gold.png" alt="" className="nav-icon" /> Hangar Analyzer
          </button>
        </nav>
      </div>
    </header>
  );
}
