import { RatingBar } from '../common/RatingBar';
import { ScoreMeter } from '../common/ScoreMeter';

export function TitanCard({ titan, onClick }) {
  return (
    <div
      className="glass-panel glass-panel-hover robot-card"
      style={{ overflow: 'visible' }}
      onClick={() => onClick(titan, 'Titans')}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(titan, 'Titans'); } }}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${titan.name}`}
    >
      <div className="robot-card-header">
        <div>
          <h3 style={{ fontSize: '20px', color: 'var(--purple)' }}>{titan.name}</h3>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Titan Class</span>
        </div>
        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '2px', fontWeight: 600 }}>VALUE RATING</span>
          <RatingBar rating={titan.value_rating} unitType="titan" align="right" />
        </div>
      </div>

      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '8px 0' }}>
        {titan.comments}
      </p>

      {/* Scores bars */}
      <div className="robot-scores">
        <ScoreMeter label="Longevity" score={titan.scores.longevity} />
        <ScoreMeter label="Lethality" score={titan.scores.lethality} />
        <ScoreMeter label="Mobility" score={titan.scores.mobility} />
        <ScoreMeter label="Utility" score={titan.scores.utility} />
        <ScoreMeter label="Accessibility" score={titan.scores.accessibility} />
        <ScoreMeter label="Overall Score" score={titan.scores.overall} />
      </div>
    </div>
  );
}
