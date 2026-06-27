import { useMemo } from 'react';
import robotGuideData from '../../data/robot_guide.json';
import weaponsDpsData from '../../data/weapons_dps.json';
import tiersData from '../../data/tiers.json';
import { RatingBar } from '../common/RatingBar';

export function DashboardTab({ onItemClick }) {
  // Memoize featured robots to avoid inline filtering and sorting on every render
  const featuredRobots = useMemo(() => {
    if (!robotGuideData?.robots) return [];

    // 1. Get F2P friendly robots (value_rating >= 3)
    const f2p = robotGuideData.robots
      .filter(r => r.value_rating >= 3)
      .sort((a, b) => b.value_rating - a.value_rating)
      .slice(0, 6)
      .map(r => ({ ...r, isMeta: false }));

    // 2. Get Meta robots (Tier X from tiersData, and value_rating < 3)
    const tierXNames = new Set(
      tiersData?.Robots?.X?.items?.map(item => item.name.toLowerCase()) || []
    );

    const meta = robotGuideData.robots
      .filter(r => r.value_rating < 3 && tierXNames.has(r.name.toLowerCase()))
      .sort((a, b) => {
        const overallDiff = b.scores.overall - a.scores.overall;
        if (overallDiff !== 0) return overallDiff;
        return b.value_rating - a.value_rating;
      })
      .slice(0, 2)
      .map(r => ({ ...r, isMeta: true }));

    return [...f2p, ...meta];
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

  const handleCardClick = (item) => {
    if (!onItemClick) return;

    let description = '';
    const cleanName = item.name.replace(/\*+$/, '').trim().toLowerCase();
    const isUe = cleanName.startsWith('ue ');
    const category = 'Robots';

    if (tiersData && tiersData[category]) {
      const catData = tiersData[category];
      for (const tierLetter of Object.keys(catData)) {
        const found = catData[tierLetter].items.find(tItem => {
          const tClean = tItem.name.replace(/\*+$/, '').trim().toLowerCase();
          const tIsUe = tClean.startsWith('ue ');
          if (isUe !== tIsUe) return false;
          return tClean === cleanName || cleanName.includes(tClean) || tClean.includes(cleanName);
        });
        if (found) {
          description = found.description;
          break;
        }
      }
    }

    if (!description) {
      description = item.comments;
    }

    onItemClick(item.name, category, { description });
  };

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
            <div className="stat-label">Robots and Titans evaluated</div>
          </div>
        </div>
        <div className="glass-panel stat-card">
          <div className="stat-icon">
            <img src="/icons/weapon_gold.png" alt="Weapon Icon" style={{ width: '36px', height: '36px', objectFit: 'contain' }} />
          </div>
          <div>
            <div className="stat-number">{stats.totalWeapons}</div>
            <div className="stat-label">Robot and Titan weapons tested</div>
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
              <img src="/icons/role_sniper_top.png" alt="" style={{ width: '26px', height: '26px', objectFit: 'contain' }} /> Featured Robots
            </h3>
            <div className="dashboard-grid">
              {/* Show high-value robots (Value Rating >= 3) sorted by rating */}
              {featuredRobots.map(robot => (
                <div 
                  className="glass-panel glass-panel-hover robot-card" 
                  key={robot.name} 
                  style={{ background: 'rgba(255,255,255,0.01)', padding: '16px', display: 'flex', flexDirection: 'column' }}
                  onClick={() => handleCardClick(robot)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCardClick(robot); } }}
                  tabIndex={0}
                  role="button"
                  aria-label={`View details for ${robot.name}`}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h4 style={{ color: 'var(--cyan)', margin: 0 }}>{robot.name}</h4>
                      <span 
                        className="role-badge" 
                        style={{ 
                          fontSize: '10px', 
                          padding: '1px 6px', 
                          background: robot.isMeta ? 'rgba(251, 191, 36, 0.1)' : 'rgba(34, 197, 94, 0.1)', 
                          color: robot.isMeta ? '#fbbf24' : '#22c55e', 
                          borderColor: robot.isMeta ? 'rgba(251, 191, 36, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                          textTransform: 'uppercase',
                          fontWeight: 700,
                          borderRadius: '4px',
                          border: '1px solid',
                          lineHeight: 1
                        }}
                      >
                        {robot.isMeta ? 'Meta' : 'F2P'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', minWidth: '100px', justifyContent: 'flex-end' }}>
                      <RatingBar rating={robot.value_rating} unitType="robot" align="right" />
                    </div>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: 1.5, flexGrow: 1 }}>
                    {robot.comments.slice(0, 160)}...
                  </p>
                  
                  {robot.roles && robot.roles.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {robot.roles.map(r => (
                        <span 
                          key={r.role} 
                          className={`role-badge ${r.type}`} 
                          style={{ fontSize: '10px', padding: '1px 6px' }}
                        >
                          {r.role} {r.type === 'primary' ? '★' : '☆'}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Community & Recent Changes Log */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-panel">
            <h3 style={{ fontSize: '18px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img src="/icons/clan_hangar_gold.png" alt="" style={{ width: '26px', height: '26px', objectFit: 'contain' }} /> Join our Official Communities
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
                  <div className="community-card-icon reddit" style={{ background: 'none', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src="/icons/reddit_logo.png" alt="Reddit" style={{ width: '32px', height: '32px', objectFit: 'cover' }} />
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
                  <div className="community-card-icon discord" style={{ background: 'none', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src="/icons/discord_logo.png" alt="Discord" style={{ width: '32px', height: '32px', objectFit: 'cover' }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>Join our Discord!</div>
                  </div>
                </div>
              </a>
            </div>
          </div>
          
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', padding: 0 }}>
            <h3 style={{ 
              fontSize: '18px', 
              padding: '24px 24px 12px 24px',
              margin: 0,
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              borderBottom: '1px solid var(--border-light)'
            }}>
              <img src="/icons/time_gold.png" alt="" style={{ width: '24px', height: '24px', objectFit: 'contain' }} /> Changelog
            </h3>
            <div style={{ 
              maxHeight: '480px', 
              overflowY: 'auto', 
              padding: '16px 24px 24px 24px',
              display: 'flex', 
              flexDirection: 'column', 
              gap: '16px' 
            }}>
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
