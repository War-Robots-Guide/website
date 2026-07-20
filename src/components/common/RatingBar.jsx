
import { getRatingColor, getRatingColorsList } from '../../utils/ratingColors';

export function RatingBar({ rating, align = 'left' }) {
  const minVal = 0;
  const maxVal = 50;
  
  const clampedRating = Math.max(minVal, Math.min(maxVal, rating));
  const percentage = Math.round(((clampedRating - minVal) / (maxVal - minVal)) * 10000) / 100;
  
  const getRatingLabel = (val) => {
    if (val <= 15) return `Horrible (${val})`;
    if (val <= 20) return `Bad (${val})`;
    if (val <= 25) return `Poor (${val})`;
    if (val <= 30) return `Fair (${val})`;
    if (val <= 35) return `Good (${val})`;
    if (val <= 40) return `Very Good (${val})`;
    if (val <= 45) return `Excellent (${val})`;
    return `Best (${val})`;
  };

  const colorsList = getRatingColorsList();

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
            borderTop: '6px solid #fff',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
            zIndex: 2
          }}
        ></div>
      </div>
    </div>
  );
}


