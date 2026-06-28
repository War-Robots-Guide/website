export function QuickStats({ stats }) {
  return (
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
  );
}
