
export function RatingBar({ rating, unitType = 'robot', align = 'left' }) {
  const isTitan = unitType === 'titan';
  const minVal = -2;
  const maxVal = isTitan ? 3 : 5;
  
  // Clamp rating
  const clampedRating = Math.min(maxVal, Math.max(minVal, rating));
  // Calculate percentage
  const percentage = ((clampedRating - minVal) / (maxVal - minVal)) * 100;
  
  const getRatingLabel = (val) => {
    if (isTitan) {
      if (val <= -2) return 'Horrible (-2)';
      if (val === -1) return 'Bad (-1)';
      if (val === 0) return 'Poor (0)';
      if (val === 1) return 'Average (+1)';
      if (val === 2) return 'Very Good (+2)';
      return 'Excellent (+3)';
    } else {
      if (val <= -2) return 'Horrible (-2)';
      if (val === -1) return 'Bad (-1)';
      if (val === 0) return 'Poor (0)';
      if (val === 1) return 'Usable (+1)';
      if (val === 2) return 'Good (+2)';
      if (val === 3) return 'Very Good (+3)';
      if (val === 4) return 'Excellent (+4)';
      return 'Best (+5)';
    }
  };

  const getRatingColor = (val) => {
    if (val <= -2) return '#ef4444'; // Red
    if (val === -1) return '#f97316'; // Orange
    if (val === 0) return '#eab308'; // Yellow
    if (val === 1) return '#84cc16'; // Lime
    if (val === 2) return '#22c55e'; // Green
    if (val === 3) return '#10b981'; // Emerald
    if (val === 4) return '#06b6d4'; // Cyan
    return '#fbbf24'; // Gold
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '4px', 
      width: '100%', 
      maxWidth: '160px',
      marginLeft: align === 'right' ? 'auto' : '0'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '11px', fontWeight: 700, color: getRatingColor(clampedRating) }}>
          {getRatingLabel(clampedRating)}
        </span>
      </div>
      <div style={{ 
        width: '100%', 
        height: '6px', 
        borderRadius: '3px', 
        background: 'linear-gradient(to right, #ef4444 0%, #eab308 50%, #22c55e 100%)', 
        position: 'relative',
        marginTop: '6px',
        marginBottom: '4px'
      }}>
        <div style={{
          position: 'absolute',
          left: `${percentage}%`,
          top: '-6px',
          transform: 'translateX(-50%)',
          width: 0,
          height: 0,
          borderLeft: '4px solid transparent',
          borderRight: '4px solid transparent',
          borderTop: '6px solid #fff',
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))'
        }}></div>
      </div>
    </div>
  );
}
