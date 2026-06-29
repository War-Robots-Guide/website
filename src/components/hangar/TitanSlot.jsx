import { X } from 'lucide-react';
import { RatingBar } from '../common/RatingBar';

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
          borderRadius: '12px',
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

        <h4 style={{ fontSize: '16px', color: 'var(--purple)', margin: '0 0 6px 0', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', maxWidth: '140px' }} title={item.name}>
          {item.name}
        </h4>

        <div style={{ display: 'flex', width: '100%', marginBottom: '10px' }}>
          <RatingBar rating={item.value_rating} unitType="titan" />
        </div>
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
        borderRadius: '12px',
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
