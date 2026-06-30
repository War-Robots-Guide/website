
import { getRatingColor, getRatingColorsList } from '../../utils/ratingColors';

export function RatingBar({ rating, unitType = 'robot', align = 'left' }) {
  const isTitan = unitType === 'titan';
  const minVal = -2;
  const maxVal = 3;
  
  // Clamp rating for visual bar positioning: allow it to overflow to 125% when rating > 3
  const clampedRating = Math.max(minVal, rating);
  const percentage = Math.max(0, Math.min(125, ((clampedRating - minVal) / (maxVal - minVal)) * 100));
  
  const getRatingLabel = (val) => {
    const formattedVal = val > 0 ? `+${val}` : val;
    if (isTitan) {
      if (val <= -2) return `Horrible (${formattedVal})`;
      if (val === -1) return 'Bad (-1)';
      if (val === 0) return 'Poor (0)';
      if (val === 1) return 'Usable (+1)';
      if (val === 2) return 'Very Good (+2)';
      return `Best (${formattedVal})`;
    } else {
      if (val <= -2) return `Horrible (${formattedVal})`;
      if (val === -1) return 'Bad (-1)';
      if (val === 0) return 'Poor (0)';
      if (val === 1) return 'Usable (+1)';
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
            borderTop: `6px solid ${isBroken ? colorsList[5] : '#fff'}`,
            filter: isBroken
              ? `drop-shadow(0 0 5px ${colorsList[5]}) drop-shadow(0 2px 4px rgba(0,0,0,0.5))`
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
              background: `linear-gradient(to right, ${colorsList[5]} 35%, rgba(59, 130, 246, 0.4) 70%, rgba(59, 130, 246, 0) 100%)`,
              zIndex: 1,
              borderRadius: '2px',
              transformOrigin: 'left center'
            }} />

            {/* Shards breaking off */}
            <div className="bar-shard shard-1" style={{ background: colorsList[5] }} />
            <div className="bar-shard shard-2" style={{ background: colorsList[5] }} />
            <div className="bar-shard shard-3" style={{ background: colorsList[5] }} />

            {/* Spill Droplets from the break */}
            <div className="spill-droplet" style={{ left: '91%', top: '1px', '--drip-x': '15px', '--drip-y': '-6px', animationDelay: '0s', animationDuration: '0.8s' }} />
            <div className="spill-droplet" style={{ left: '93%', top: '3px', '--drip-x': '25px', '--drip-y': '8px', animationDelay: '0.2s', animationDuration: '1.1s' }} />
            <div className="spill-droplet" style={{ left: '90%', top: '4px', '--drip-x': '10px', '--drip-y': '12px', animationDelay: '0.4s', animationDuration: '0.7s' }} />
            <div className="spill-droplet" style={{ left: '92%', top: '2px', '--drip-x': '30px', '--drip-y': '2px', animationDelay: '0.6s', animationDuration: '1.3s' }} />
            <div className="spill-droplet" style={{ left: '94%', top: '5px', '--drip-x': '18px', '--drip-y': '6px', animationDelay: '0.8s', animationDuration: '0.9s' }} />

            {/* Spill Droplets from the needle */}
            <div className="spill-droplet" style={{ left: `${percentage}%`, top: '4px', '--drip-x': '5px', '--drip-y': '15px', animationDelay: '0.1s', animationDuration: '1.0s' }} />
            <div className="spill-droplet" style={{ left: `${percentage}%`, top: '4px', '--drip-x': '-5px', '--drip-y': '18px', animationDelay: '0.5s', animationDuration: '1.2s' }} />
          </>
        )}
      </div>
    </div>
  );
}


