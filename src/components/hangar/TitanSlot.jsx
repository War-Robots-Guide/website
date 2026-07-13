import { X } from 'lucide-react';
import { RatingBar } from '../common/RatingBar';
import robotGuideData from '../../data/robot_guide.json';
import { getTierForName } from '../../utils/tierLookup';

export function TitanSlot({ item, onOpenSelector, onClearSlot }) {
  if (item) {
    return (
      <div
        className="glass-panel glass-panel-hover"
        style={{
          display: 'flex',
          flexDirection: 'column',
          padding: '16px',
          minHeight: '180px',
          borderRadius: '16px',
          position: 'relative',
          border: '1px solid rgba(59, 130, 246, 0.4)',
          background: 'rgba(59, 130, 246, 0.05)',
          overflow: 'visible'
        }}
      >
        <button
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
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
          return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px', gap: '8px' }}>
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
          );
        })()}

        <div style={{ display: 'flex', flexDirection: 'column', width: '100%', marginBottom: '10px', gap: '2px' }}>
          <span style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Value Rating
          </span>
          <RatingBar rating={item.value_rating} unitType="titan" />
        </div>

        {item.roles && item.roles.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: 'auto' }}>
            {item.roles.map(r => {
              const tooltipText = r.footnote ? robotGuideData?.footnotes?.[parseInt(r.footnote) - 1] || r.footnote : '';
              return (
                <span
                  key={r.role}
                  className={`role-badge ${r.type}`}
                  style={{ fontSize: '10px', padding: '1px 6px', display: 'inline-block', width: 'fit-content' }}
                  title={tooltipText}
                >
                  {r.role}{r.footnote && <sup style={{ marginLeft: '2px' }}>*</sup>} {r.type === 'primary' ? '★' : '☆'}
                </span>
              );
            })}
          </div>
        ) : (
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 'auto' }}>No specific roles</span>
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
      <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Click to select</span>
    </div>
  );
}
