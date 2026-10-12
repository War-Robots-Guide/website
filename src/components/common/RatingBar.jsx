import { getRatingColor, getValueRatingTiers, getRatingTierIndex } from '../../utils/ratingColors';

export function RatingBar({ rating, align = 'left' }) {
  const tiers = getValueRatingTiers();
  const activeTierIndex = getRatingTierIndex(rating);

  const getRatingLabel = (val) => {
    if (val <= 20) return `Bad (${val})`;
    if (val <= 25) return `Poor (${val})`;
    if (val <= 30) return `Fair (${val})`;
    if (val <= 34) return `Good (${val})`;
    return `Best (${val})`;
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '4px', 
      width: '110px',
      marginLeft: align === 'right' ? 'auto' : '0'
    }}>
      <div className="row-between">
        <span style={{ fontSize: '11px', fontWeight: 700, color: getRatingColor(rating) }}>
          {getRatingLabel(rating)}
        </span>
      </div>
      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(5, 1fr)', 
          gap: '3px',
          width: '100%', 
          marginTop: '4px',
          marginBottom: '4px'
        }}
        data-testid="rating-segments"
      >
        {tiers.map((tier, idx) => {
          const isActive = idx <= activeTierIndex;
          const isCurrentTier = idx === activeTierIndex;
          return (
            <div
              key={tier.label}
              data-testid={`rating-segment-${idx}`}
              title={`${tier.label} (Tier ${idx + 1}/5)`}
              style={{
                height: '6px',
                borderRadius: '3px',
                backgroundColor: isActive ? tier.color : 'rgba(255, 255, 255, 0.08)',
                boxShadow: isCurrentTier ? `0 0 6px ${tier.color}80` : 'none',
                transition: 'background-color 0.2s ease, box-shadow 0.2s ease'
              }}
            />
          );
        })}
      </div>
    </div>
  );
}



