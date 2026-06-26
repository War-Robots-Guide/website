import { useMemo } from 'react';
import { Star, Users, Wrench } from 'lucide-react';
import robotGuideData from '../../data/robot_guide.json';
import weaponsDpsData from '../../data/weapons_dps.json';

export function DashboardTab({ onTabChange }) {
  // Memoize featured robots to avoid inline filtering and sorting on every render
  const featuredRobots = useMemo(() => {
    return robotGuideData?.robots
      ?.filter(r => r.value_rating >= 3)
      .sort((a, b) => b.value_rating - a.value_rating) || [];
  }, []);

  const sortedChangelog = useMemo(() => {
    if (!robotGuideData?.changelog) return [];
    return [...robotGuideData.changelog].sort((a, b) => b.date.localeCompare(a.date));
  }, []);

  // Memoize changelog to avoid inline slicing on every render
  const recentChangelog = useMemo(() => {
    return sortedChangelog.slice(0, 10);
  }, [sortedChangelog]);

  const stats = useMemo(() => {
    const totalRobots = robotGuideData?.robots?.length || 0;
    const totalTitans = robotGuideData?.titans?.length || 0;
    const totalBuilds = robotGuideData?.builds?.length || 0;
    
    let totalWeaponsCount = 0;
    if (weaponsDpsData) {
      Object.keys(weaponsDpsData).forEach(k => {
        totalWeaponsCount += weaponsDpsData[k]?.length || 0;
      });
    }
    
    const latestChange = sortedChangelog[0] || { date: 'N/A', text: 'No recent updates' };
    
    return {
      totalRobots,
      totalTitans,
      totalBuilds,
      totalWeapons: totalWeaponsCount,
      latestChange
    };
  }, [sortedChangelog]);

  return (
    <div className="animate-fade-in">
      {/* Banner image and tagline */}
      <div className="hero-banner" style={{ padding: 0, overflow: 'hidden', position: 'relative' }}>
        <img 
          src="banner.jpg" 
          alt="War Robots Hangar Banner" 
          className="dashboard-hero-img"
        />
        <div className="dashboard-hero-overlay">
          <h1 className="dashboard-hero-title">
            Ultimate War Robots Database & Guides
          </h1>
          <p className="dashboard-hero-desc">
            Welcome to the database compiled by the expert community at <span style={{ color: 'var(--cyan)', fontWeight: 600 }}>r/WarRobotsGuide</span>. 
            Get recommendations on weapon DPS, robot ratings, modules, pilots, and meta strategies.
          </p>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="dashboard-stats">
        <div className="glass-panel stat-card">
          <div className="stat-icon">
            <img src="/icons/robot_gold.png" alt="Robot Icon" style={{ width: '36px', height: '36px', objectFit: 'contain' }} />
          </div>
          <div>
            <div className="stat-number">{stats.totalRobots + stats.totalTitans}</div>
            <div className="stat-label">Robots & Titans evaluated</div>
          </div>
        </div>
        <div className="glass-panel stat-card">
          <div className="stat-icon">
            <img src="/icons/weapon_gold.png" alt="Weapon Icon" style={{ width: '36px', height: '36px', objectFit: 'contain' }} />
          </div>
          <div>
            <div className="stat-number">{stats.totalWeapons}</div>
            <div className="stat-label">Weapons tested</div>
          </div>
        </div>
        <div className="glass-panel stat-card">
          <div className="stat-icon">
            <img src="/icons/blackmarket_gold.png" alt="Build Icon" style={{ width: '36px', height: '36px', objectFit: 'contain' }} />
          </div>
          <div>
            <div className="stat-number">{stats.totalBuilds}</div>
            <div className="stat-label">Mini build guides</div>
          </div>
        </div>
      </div>

      {/* Top Grid layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', textAlign: 'left' }} className="responsive-split">
        {/* Left Column: Featured Metas & Brief */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-panel">
            <h3 style={{ fontSize: '20px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Star className="cyan-glow-text" size={20} fill="currentColor" /> Featured Robots
            </h3>
            <div className="dashboard-grid">
              {/* Show high-value robots (Value Rating >= 3) sorted by rating */}
              {featuredRobots.map(robot => (
                <div className="glass-panel glass-panel-hover" key={robot.name} style={{ background: 'rgba(255,255,255,0.01)', padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h4 style={{ color: 'var(--cyan)' }}>{robot.name}</h4>
                    <span className="role-badge primary" style={{ background: 'rgba(251,191,36,0.1)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.2)' }}>
                      Value: {robot.value_rating}/5
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: 1.5 }}>
                    {robot.comments.slice(0, 160)}...
                  </p>
                  <button 
                    className="compare-action-btn" 
                    style={{ padding: '6px 12px', fontSize: '11px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid var(--border-light)' }}
                    onClick={() => onTabChange('robots')}
                  >
                    View Detailed Scores
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Community & Recent Changes Log */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-panel">
            <h3 style={{ fontSize: '18px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={16} className="cyan-glow-text" /> Join our Official Communities
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.5, marginBottom: '16px' }}>
              Meet fellow commanders, discuss guides, and get detailed hangar feedback from veterans.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <a 
                href="https://www.reddit.com/r/WarRobotsGuide/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="community-card-link"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="community-card-icon reddit">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                      <path d="M24 11.5c0-1.65-1.35-3-3-3-.96 0-1.86.48-2.42 1.24-1.64-1-3.85-1.64-6.29-1.72l1.3-4.14c.05-.15.22-.24.38-.19l4.24.9c.06.87.79 1.56 1.68 1.56 1.05 0 1.9-.85 1.9-1.9s-.85-1.9-1.9-1.9c-.89 0-1.62.62-1.82 1.45l-4.75-1.01c-.32-.07-.63.13-.71.45l-1.46 4.67c-2.52.03-4.8.67-6.49 1.7-.56-.73-1.44-1.21-2.43-1.21-1.65 0-3 1.35-3 3 0 1.13.63 2.11 1.56 2.62-.06.29-.1.59-.1.9 0 4.14 4.93 7.5 11 7.5s11-3.36 11-7.5c0-.31-.04-.61-.1-.9.93-.51 1.56-1.49 1.56-2.62zM9 13c.83 0 1.5.67 1.5 1.5S9.83 16 9 16s-1.5-.67-1.5-1.5S7.67 13 9 13zm7.5 5.5c-1.86 1.86-5.14 1.86-7 0-.2-.2-.2-.51 0-.71.2-.2.51-.2.71 0 1.47 1.47 4.1 1.47 5.58 0 .2-.2.51-.2.71 0 .2.2.2.51 0 .71zm-.5-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5 0.67 1.5 1.5-0.67 1.5-1.5 1.5z"/>
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>Check out our subreddit!</div>
                  </div>
                </div>
              </a>

              <a 
                href="https://discord.gg/FPxpXthPS" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="community-card-link"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="community-card-icon discord">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.094 13.094 0 0 1-1.873-.894.077.077 0 0 1-.008-.128c.126-.093.252-.19.372-.287a.075.075 0 0 1 .077-.011c3.92 1.793 8.18 1.793 12.061 0a.073.073 0 0 1 .078.009c.12.099.246.195.373.289a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.156 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.156 2.418z"/>
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>Join our Discord!</div>
                  </div>
                </div>
              </a>
            </div>
          </div>
          
          <div className="glass-panel" style={{ maxHeight: '550px', overflowY: 'auto' }}>
            <h3 style={{ 
              fontSize: '18px', 
              marginBottom: '12px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              position: 'sticky', 
              top: '-24px', 
              marginTop: '-24px', 
              marginLeft: '-24px',
              marginRight: '-24px',
              paddingTop: '16px', 
              paddingBottom: '16px', 
              paddingLeft: '24px',
              paddingRight: '24px',
              background: '#122538', 
              zIndex: 10 
            }}>
              <Wrench size={16} className="cyan-glow-text" /> Changelog
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {recentChangelog.map((log, index) => (
                <div key={index} style={{ borderLeft: '2px solid var(--cyan)', paddingLeft: '12px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--cyan)', fontWeight: 600 }}>{log.date}</span>
                  <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
                    {log.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
