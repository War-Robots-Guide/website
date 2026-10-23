import { sortRoles } from '../../utils/roles';
import { X } from 'lucide-react';
import { RatingBar } from '../common/RatingBar';
import robotGuideData from '../../data/robot_guide.json';
import { getTierForName } from '../../utils/tierLookup';
import { getRobotImage, getRoleIcon } from '../../utils/imageUtils';

export function TitanSlot({ item, onOpenSelector, onClearSlot }) {
  if (item) {
    return (
      <div
        className="glass-panel glass-panel-hover"
        style={{
          display: 'flex',
          flexDirection: 'column',
          padding: '16px',
          minHeight: '260px',
          borderRadius: '16px',
          position: 'relative',
          border: '1px solid rgba(59, 130, 246, 0.4)',
          background: 'rgba(59, 130, 246, 0.05)',
          overflow: 'visible'
        }}
      >
        <button
          className="slot-remove-button"
          onClick={(e) => onClearSlot(5, e)}
          title="Clear slot"
        >
          <X size={14} />
        </button>

        <span style={{ fontSize: '11px', color: 'var(--purple)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>
          Titan Slot
        </span>

        {(() => {
          const tier = getTierForName(item.name, 'Titans') || 'Z';
          const tierLower = tier.toLowerCase();
          const imageUrl = getRobotImage(item.name);
          return (
            <>
              {imageUrl && (
                <div className="slot-image-frame">
                  <img
                    src={imageUrl}
                    alt={item.name}
                    className="slot-image"
                  />
                </div>
              )}
              <div className="slot-title-row">
                <h4 style={{ fontSize: '16px', color: 'var(--purple)', margin: 0, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', maxWidth: '110px' }} title={item.name}>
                  {item.name}
                </h4>
                <span 
                  className={`tier-badge-${tierLower}`} 
                  style={{ 
                    fontSize: '11px', 
                    fontWeight: 700, 
                    background: `var(--tier-${tierLower}-bg)`, 
                    color: `var(--tier-${tierLower})`, 
                    border: `1px solid var(--tier-${tierLower}-border)`, 
                    padding: '2px 6px', 
                    borderRadius: '4px' 
                  }}
                >
                  {tier} Tier
                </span>
              </div>
            </>
          );
        })()}

        <div className="slot-rating">
          <span className="rating-caption">
            Value Rating
          </span>
          <RatingBar rating={item.value_rating} unitType="titan" />
        </div>

        {item.roles && item.roles.length > 0 ? (
          <div className="slot-roles">
            {sortRoles(item.roles).map(r => {
              const tooltipText = r.footnote ? robotGuideData?.footnotes?.[parseInt(r.footnote) - 1] || r.footnote : '';
              const roleIcon = r.type === 'main' ? getRoleIcon(r.role) : null;
              return (
                <span
                  key={r.role}
                  className={`slot-role-badge role-badge ${r.type}`}
                  title={tooltipText}
                >
                  {roleIcon && <img src={roleIcon} alt="" className="icon-12" />}
                  {r.role}{r.footnote && <sup className="slot-role-name">*</sup>} {r.type === 'main' ? '✦' : (r.type === 'primary' ? '★' : '☆')}
                </span>
              );
            })}
          </div>
        ) : (
          <span className="slot-empty-roles">No specific roles</span>
        )}
      </div>
    );
  }

  return (
    <div
      className="glass-panel glass-panel-hover"
      style={{
        border: '2px dashed rgba(59, 130, 246, 0.4)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        minHeight: '180px',
        cursor: 'pointer',
        borderRadius: '16px',
        transition: 'all 0.3s ease',
        background: 'rgba(59, 130, 246, 0.02)'
      }}
      onClick={() => onOpenSelector(5)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpenSelector(5);
        }
      }}
      tabIndex={0}
      role="button"
      aria-label="Select Titan"
    >
      <div style={{ fontSize: '32px', color: 'var(--purple)', marginBottom: '8px' }}>+</div>
      <span style={{ fontSize: '13px', color: 'var(--purple)', fontWeight: 700 }}>TITAN SLOT</span>
      <span className="slot-empty-hint">Click to select</span>
    </div>
  );
}
