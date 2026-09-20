import { ROUTES } from '../../config/routes';

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
          {ROUTES.map((route) => (
            <a
              key={route.id}
              href={route.path}
              className={`nav-item ${activeTab === route.id ? 'active' : ''}`}
              onClick={(e) => handleNavClick(e, route.id)}
            >
              <img src={route.navIcon} alt="" className="nav-icon" /> {route.navLabel}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
