export function Header({ activeTab, onTabChange, isEasterEggActive }) {
  const handleNavClick = (e, tab) => {
    e.preventDefault();
    onTabChange(tab);
  };

  return (
    <header 
      className="header"
      style={isEasterEggActive ? { 
        background: 'rgba(7, 8, 12, 0.35)', 
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)' 
      } : {}}
    >
      <div className="header-content">
        <a 
          href="/"
          className="logo-container" 
          onClick={(e) => handleNavClick(e, 'dashboard')}
          style={{ textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <img src="/WRGICON.png" alt="War Robots Guide Logo" className="logo-img" />
          <span className="logo-text">War Robots Guide</span>
        </a>
        
        <nav className="nav-links">
          <a href="/" className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={(e) => handleNavClick(e, 'dashboard')}>
            <img src="/icons/ship_gold.png" alt="" className="nav-icon" /> Home
          </a>
          <a href="/tiers" className={`nav-item ${activeTab === 'tiers' ? 'active' : ''}`} onClick={(e) => handleNavClick(e, 'tiers')}>
            <img src="/icons/hint_operation.png" alt="" className="nav-icon" /> Tier Lists
          </a>
          <a href="/robots" className={`nav-item ${activeTab === 'robots' ? 'active' : ''}`} onClick={(e) => handleNavClick(e, 'robots')}>
            <img src="/icons/actions_orange.png" alt="" className="nav-icon" /> Value Ratings
          </a>
          <a href="/builds" className={`nav-item ${activeTab === 'builds' ? 'active' : ''}`} onClick={(e) => handleNavClick(e, 'builds')}>
            <img src="/icons/drone_gold.png" alt="" className="nav-icon" /> Build Guides
          </a>
          <a href="/specializations" className={`nav-item ${activeTab === 'specializations' ? 'active' : ''}`} onClick={(e) => handleNavClick(e, 'specializations')}>
            <img src="/icons/module_old_gold.png" alt="" className="nav-icon" /> Specializations
          </a>
          <a href="/pilots" className={`nav-item ${activeTab === 'pilots' ? 'active' : ''}`} onClick={(e) => handleNavClick(e, 'pilots')}>
            <img src="/icons/pilot_gold.png" alt="" className="nav-icon" /> Pilot Skills
          </a>
          <a href="/weapons" className={`nav-item ${activeTab === 'weapons' ? 'active' : ''}`} onClick={(e) => handleNavClick(e, 'weapons')}>
            <img src="/icons/weapon_gold.png" alt="" className="nav-icon" /> Weapon DPS
          </a>
          <a href="/hangar" className={`nav-item ${activeTab === 'hangar' ? 'active' : ''}`} onClick={(e) => handleNavClick(e, 'hangar')}>
            <img src="/icons/microchip_gold.png" alt="" className="nav-icon" /> Hangar Analyzer
          </a>
        </nav>
      </div>
    </header>
  );
}
