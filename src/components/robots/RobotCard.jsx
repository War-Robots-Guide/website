import { RatingBar } from '../common/RatingBar';
import { getTierForName } from '../../utils/tierLookup';
import { getRobotImage } from '../../utils/imageUtils';

export function RobotCard({ robot, onClick }) {
  const tier = getTierForName(robot.name, 'Robots');
  const isUltimate = robot.sheet === 'Ultimate Robots' || robot.name.toLowerCase().startsWith('ue ');
  const imageUrl = getRobotImage(robot.name);
  const tierKey = tier ? tier.toLowerCase() : 'z';

  return (
    <div
      className={`glass-panel glass-panel-hover robot-image-card ${isUltimate ? 'ultimate-robot-card' : ''}`}
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
        border: isUltimate ? '1px solid rgba(234, 179, 8, 0.35)' : '1px solid var(--border-light)',
        background: 'linear-gradient(180deg, rgba(24, 38, 58, 0.5) 0%, rgba(14, 22, 35, 0.65) 100%)',
      }}
      onClick={() => onClick(robot, 'Robots')}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(robot, 'Robots');
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${robot.name}`}
    >
      {/* Robot Image */}
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
            objectPosition: 'center 25%',
            zIndex: 0,
            filter: 'brightness(1.15) contrast(1.05)',
            transition: 'transform 0.3s ease',
          }}
          className="robot-card-bg-img"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      ) : null}

      {/* Subtle Scrim Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(8, 14, 24, 0.5) 0%, rgba(8, 14, 24, 0.05) 45%, rgba(8, 14, 24, 0.6) 100%)',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />

      {/* Top Header: Name and Tier on left, Value Rating Bar on right */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
            <h3
              style={{
                fontSize: '19px',
                fontWeight: 700,
                color: isUltimate ? '#fef08a' : '#fff',
                margin: 0,
                textShadow: '0 2px 4px rgba(0,0,0,0.8)',
              }}
            >
              {robot.name}
            </h3>
            {tier && (
              <span
                className={`tier-badge-${tierKey}`}
                style={{
                  fontSize: '10px',
                  fontWeight: 800,
                  padding: '2px 7px',
                  borderRadius: '4px',
                  background: `var(--tier-${tierKey}-bg)`,
                  color: `var(--tier-${tierKey})`,
                  border: `1px solid var(--tier-${tierKey}-border)`,
                  textTransform: 'uppercase',
                  lineHeight: 1,
                }}
              >
                {tier} Tier
              </span>
            )}
            {isUltimate && (
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 800,
                  padding: '2px 6px',
                  borderRadius: '4px',
                  background: 'rgba(234, 179, 8, 0.2)',
                  color: '#fbbf24',
                  border: '1px solid rgba(234, 179, 8, 0.4)',
                  textTransform: 'uppercase',
                  lineHeight: 1,
                }}
              >
                Ultimate
              </span>
            )}
          </div>
          {robot.sheet && (
            <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.65)' }}>{robot.sheet}</span>
          )}
        </div>

        {/* Top Right: Value Rating Bar without big box */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0 }}>
          <span style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>
            VALUE RATING
          </span>
          <RatingBar rating={robot.value_rating} unitType="robot" align="right" />
        </div>
      </div>

      {/* Screen-reader hidden details */}
      <div className="sr-only">
        {robot.comments}
      </div>
    </div>
  );
}
