import { RatingBar } from '../common/RatingBar';
import { getTierForName } from '../../utils/tierLookup';
import { getRobotImage } from '../../utils/imageUtils';

export function FeaturedRobots({ featuredRobots, handleCardClick }) {
  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <h3 style={{ fontSize: '20px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#fff' }}>
        <img src="/icons/role_sniper_top.png" alt="" style={{ width: '26px', height: '26px', objectFit: 'contain' }} /> Featured Robots
      </h3>
      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
        Top-rated meta powerhouses and premier F2P robots. Click any robot to view it in the Tier List.
      </p>

      <div className="dashboard-grid">
        {featuredRobots.map(robot => {
          const tier = getTierForName(robot.name, 'Robots');
          const imageUrl = getRobotImage(robot.name);
          const tierKey = tier ? tier.toLowerCase() : 'z';

          return (
            <div
              className="featured-robot-image-card glass-panel-hover"
              key={robot.name}
              onClick={() => handleCardClick(robot)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleCardClick(robot);
                }
              }}
              tabIndex={0}
              role="button"
              aria-label={`View details for ${robot.name} in tier list`}
              style={{
                position: 'relative',
                height: '240px',
                borderRadius: '14px',
                overflow: 'hidden',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '16px',
                border: '1px solid var(--border-light)',
                background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.6) 0%, rgba(10, 14, 23, 0.95) 100%)',
              }}
            >
              {/* Background Robot Image */}
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={robot.name}
                  loading="lazy"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center 20%',
                    zIndex: 0,
                    transition: 'transform 0.3s ease',
                  }}
                  className="robot-card-bg-img"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : null}

              {/* Scrim Overlay Gradient for text readability */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(180deg, rgba(10, 14, 23, 0.75) 0%, rgba(10, 14, 23, 0.2) 45%, rgba(10, 14, 23, 0.9) 100%)',
                  zIndex: 1,
                  pointerEvents: 'none',
                }}
              />

              {/* Overlaid Elements on Image: Top Row with Name/Badges on Left, RatingBar on Right */}
              <div
                style={{
                  position: 'relative',
                  zIndex: 2,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '12px',
                  width: '100%',
                }}
              >
                <div>
                  <h4
                    style={{
                      margin: '0 0 6px 0',
                      fontSize: '18px',
                      fontWeight: 700,
                      color: '#fff',
                      textShadow: '0 2px 4px rgba(0,0,0,0.8)',
                    }}
                  >
                    {robot.name}
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    {tier && (
                      <span
                        className={`tier-badge-${tierKey}`}
                        style={{
                          fontSize: '10px',
                          padding: '2px 7px',
                          background: `var(--tier-${tierKey}-bg)`,
                          color: `var(--tier-${tierKey})`,
                          borderColor: `var(--tier-${tierKey}-border)`,
                          textTransform: 'uppercase',
                          fontWeight: 800,
                          borderRadius: '4px',
                          border: '1px solid',
                          lineHeight: 1,
                        }}
                      >
                        {tier} Tier
                      </span>
                    )}
                    <span
                      className="role-badge"
                      style={{
                        fontSize: '10px',
                        padding: '2px 7px',
                        background: robot.isMeta ? 'rgba(251, 191, 36, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                        color: robot.isMeta ? '#fbbf24' : '#22c55e',
                        borderColor: robot.isMeta ? 'rgba(251, 191, 36, 0.4)' : 'rgba(34, 197, 94, 0.4)',
                        textTransform: 'uppercase',
                        fontWeight: 800,
                        borderRadius: '4px',
                        border: '1px solid',
                        lineHeight: 1,
                      }}
                    >
                      {robot.isMeta ? 'Meta' : 'F2P'}
                    </span>
                  </div>
                </div>

                {/* Top Right: Value Rating Bar without big box */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0 }}>
                  <RatingBar rating={robot.value_rating} unitType="robot" align="right" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
