import { RatingBar } from '../common/RatingBar';
import { getTierForName } from '../../utils/tierLookup';
import { getRobotImage, getRoleIcon } from '../../utils/imageUtils';

export function TitanCard({ titan, onClick }) {
  const tier = getTierForName(titan.name, 'Titans');
  const isUltimate = titan.sheet === 'Ultimate Titans' || titan.name.toLowerCase().startsWith('ue ');
  const imageUrl = getRobotImage(titan.name);
  const tierKey = tier ? tier.toLowerCase() : 'z';
  const mainRoleObj = titan.roles?.find(r => r.type === 'main');
  const mainRoleIcon = mainRoleObj ? getRoleIcon(mainRoleObj.role) : null;

  return (
    <div
      className={`glass-panel glass-panel-hover titan-image-card ${isUltimate ? 'ultimate-robot-card' : ''}`}
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
      onClick={() => onClick(titan, 'Titans')}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(titan, 'Titans');
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${titan.name}`}
    >
      {/* Titan Image */}
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={titan.name}
          loading="lazy"
          className="robot-card-bg-img unit-card-image"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      ) : null}

      {/* Subtle Scrim Overlay */}
      <div
        className="unit-card-scrim"
      />

      {/* Top Header: Name and Tier on left, Value Rating Bar on right */}
      <div
        className="image-card-header"
      >
        <div>
          <div className="unit-card-title-row">
            <h3
              style={{
                fontSize: '19px',
                fontWeight: 700,
                color: isUltimate ? '#fef08a' : '#fff',
                margin: 0,
                textShadow: '0 2px 4px rgba(0,0,0,0.8)',
              }}
            >
              {titan.name}
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
            {mainRoleObj && (
              <span
                className="role-badge main unit-card-role-badge"
                title={`Main Role: ${mainRoleObj.role}`}
              >
                {mainRoleIcon && <img src={mainRoleIcon} alt="" className="icon-12" />}
                {mainRoleObj.role}
              </span>
            )}
            {isUltimate && (
              <span
                className="ultimate-badge"
              >
                Ultimate
              </span>
            )}
          </div>
          <span className="unit-card-category">Titan Class</span>
        </div>

        {/* Top Right: Value Rating Bar without big box */}
        <div className="image-card-rating">
          <span className="image-card-rating-label">
            VALUE RATING
          </span>
          <RatingBar rating={titan.value_rating} unitType="titan" align="right" />
        </div>
      </div>

      <div className="sr-only">
        {titan.comments}
      </div>
    </div>
  );
}
