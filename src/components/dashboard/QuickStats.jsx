export function QuickStats({ stats }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Database Overview</span>
        <span style={{ fontSize: '11px', color: 'var(--cyan)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Last Updated: {stats.latestChange?.date || 'N/A'}</span>
      </div>
      <div className="dashboard-stats" style={{ marginBottom: 0 }}>
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
    </div>
  );
}
