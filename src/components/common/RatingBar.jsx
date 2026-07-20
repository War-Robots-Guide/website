import { getRatingColor, getRatingColorsList, getValueRatingRange } from '../../utils/ratingColors';

export function RatingBar({ rating, align = 'left' }) {
  const { min: minVal, max: maxVal } = getValueRatingRange();
  
  const clampedRating = Math.max(minVal, Math.min(maxVal, rating));
  const percentage = Math.round(((clampedRating - minVal) / (maxVal - minVal)) * 10000) / 100;
  
  const getRatingLabel = (val) => {
    if (val <= 20) return `Bad (${val})`;
    if (val <= 25) return `Poor (${val})`;
    if (val <= 30) return `Fair (${val})`;
    if (val <= 34) return `Good (${val})`;
    return `Best (${val})`;
  };

  const colorsList = getRatingColorsList();

  const getGradientStops = () => {
    const range = maxVal - minVal;
    if (range <= 0) {
      return `linear-gradient(to right, ${colorsList[0]} 0%, ${colorsList[5]} 100%)`;
    }
    const pRed = Math.max(0, Math.min(100, ((20 - minVal) / range) * 100));
    const pOrange = Math.max(0, Math.min(100, ((25 - minVal) / range) * 100));
    const pYellow = Math.max(0, Math.min(100, ((30 - minVal) / range) * 100));
    const pGreen = Math.max(0, Math.min(100, ((34 - minVal) / range) * 100));
    const pCyan = Math.max(0, Math.min(100, ((35 - minVal) / range) * 100));
    
    return `linear-gradient(to right, 
      ${colorsList[0]} 0%, 
      ${colorsList[0]} ${pRed.toFixed(2)}%, 
      ${colorsList[1]} ${pOrange.toFixed(2)}%, 
      ${colorsList[2]} ${pYellow.toFixed(2)}%, 
      ${colorsList[4]} ${pGreen.toFixed(2)}%, 
      ${colorsList[5]} ${pCyan.toFixed(2)}%, 
      ${colorsList[5]} 100%
    )`;
  };

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
            background: getGradientStops(), 
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


