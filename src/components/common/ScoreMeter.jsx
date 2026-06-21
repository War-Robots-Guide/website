
export function ScoreMeter({ label, score, options = {} }) {
  const {
    min = -2,
    max = 3,
    customValueLabel = null,
    customPercentage = null,
    customFillColor = null,
    customBadge = null,
    useScaleLabel = true
  } = options;

  const scoreVal = parseInt(score) || 0;
  const percentage = customPercentage !== null 
    ? customPercentage 
    : Math.max(0, Math.min(100, ((scoreVal - min) / (max - min)) * 100));
  const isNegative = scoreVal < 0;
  
  return (
    <div className="score-bar-wrapper">
      <div className="score-label">
        <span>{label}</span>
        {customValueLabel !== null ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              {customValueLabel}
            </span>
            {customBadge}
          </div>
        ) : (
          <span style={{ fontWeight: 700, color: isNegative && !customFillColor ? '#ef4444' : (customFillColor || '#10b981') }}>
            {useScaleLabel ? (scoreVal > 0 ? `+${scoreVal}` : scoreVal) : scoreVal}
          </span>
        )}
      </div>
      <div className="score-track">
        <div 
          className={`score-fill ${isNegative && !customFillColor ? 'negative' : ''}`} 
          style={{ 
            width: `${percentage}%`,
            ...(customFillColor ? { 
              background: customFillColor,
              boxShadow: scoreVal > 0 || percentage > 0 ? `0 0 6px ${customFillColor}` : 'none',
              transition: 'width 0.5s ease'
            } : {})
          }}
        ></div>
      </div>
    </div>
  );
}
