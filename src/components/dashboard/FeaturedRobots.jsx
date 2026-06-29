import { RatingBar } from '../common/RatingBar';

export function FeaturedRobots({ featuredRobots, handleCardClick }) {
  return (
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
            style={{ background: 'rgba(255,255,255,0.01)', padding: '16px', display: 'flex', flexDirection: 'column', overflow: 'visible' }}
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
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', minWidth: '100px' }}>
                <span style={{ fontSize: '9.5px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '2px', letterSpacing: '0.5px' }}>
                  Value Rating
                </span>
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
  );
}
