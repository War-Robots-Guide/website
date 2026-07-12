
import { getRatingColor, getRatingColorsList } from '../../utils/ratingColors';

export function RatingBar({ rating, unitType = 'robot', align = 'left' }) {
  const isTitan = unitType === 'titan';
  const minVal = -2;
  const maxVal = 3;
  
  // Calculate percentage: 20% per step <= 3, and 10% per step > 3
  let percentage;
  if (rating <= 3) {
    const clampedRating = Math.max(minVal, rating);
    percentage = Math.max(0, ((clampedRating - minVal) / (maxVal - minVal)) * 100);
  } else {
    // Cap visual percentage at 102% so that the arrow (needle) and laser (flow) stay
    // inside the card boundaries and never clip out, while still showing overflow.
    percentage = 102;
  }
  
  const getRatingLabel = (val) => {
    const formattedVal = val > 0 ? `+${val}` : val;
    if (isTitan) {
      if (val <= -2) return `Horrible (${formattedVal})`;
      if (val === -1) return 'Bad (-1)';
      if (val === 0) return 'Poor (0)';
      if (val === 1) return 'Fair (+1)';
      if (val === 2) return 'Very Good (+2)';
      return `Best (${formattedVal})`;
    } else {
      if (val <= -2) return `Horrible (${formattedVal})`;
      if (val === -1) return 'Bad (-1)';
      if (val === 0) return 'Poor (0)';
      if (val === 1) return 'Fair (+1)';
      if (val === 2) return 'Good (+2)';
      if (val === 3) return 'Very Good (+3)';
      if (val === 4) return 'Excellent (+4)';
      return `Best (${formattedVal})`;
    }
  };

  const colorsList = getRatingColorsList();

  const isBroken = rating > 3;

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '4px', 
      width: '110px',
      marginLeft: align === 'right' ? 'auto' : '0'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '11px', fontWeight: 700, color: getRatingColor(rating) }}>
          {getRatingLabel(rating)}
        </span>
      </div>
      <div style={{ 
        width: '100%', 
        height: '6px', 
        position: 'relative',
        marginTop: '6px',
        marginBottom: '4px'
      }}>
        {/* Main Bar Fill */}
        <div 
          className={isBroken ? 'rating-bar-shattered' : ''}
          style={{
            width: '100%', 
            height: '100%', 
            borderRadius: '3px', 
            background: `linear-gradient(to right, ${colorsList[0]} 0%, ${colorsList[1]} 20%, ${colorsList[2]} 40%, ${colorsList[3]} 60%, ${colorsList[4]} 80%, ${colorsList[5]} 100%)`, 
          }}
        />
        {/* Needle */}
        <div 
          style={{
            position: 'absolute',
            left: `${percentage}%`,
            top: '-6px',
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '4px solid transparent',
            borderRight: '4px solid transparent',
            borderTop: `6px solid ${isBroken ? '#06b6d4' : '#fff'}`,
            filter: isBroken
              ? `drop-shadow(0 0 5px #06b6d4) drop-shadow(0 2px 4px rgba(0,0,0,0.5))`
              : 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
            zIndex: 2
          }}
        ></div>
        
        {/* Shatter & Spill overlay effects */}
        {isBroken && (
          <>
            {/* Spilled Blue Flow/Trail to Needle */}
            <div className="blue-spill-flow" style={{
              position: 'absolute',
              left: '90%',
              top: '1px',
              width: `${percentage - 90}%`,
              height: '4px',
              background: `linear-gradient(to right, #06b6d4 35%, rgba(6, 182, 212, 0.4) 70%, rgba(6, 182, 212, 0) 100%)`,
              zIndex: 1,
              borderRadius: '2px',
              transformOrigin: 'left center'
            }} />

            {/* Shards breaking off */}
            <div className="bar-shard shard-1" style={{ background: '#06b6d4' }} />
            <div className="bar-shard shard-2" style={{ background: '#06b6d4' }} />
            <div className="bar-shard shard-3" style={{ background: '#06b6d4' }} />
          </>
        )}
      </div>
    </div>
  );
}


