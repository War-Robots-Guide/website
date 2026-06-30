import { RatingBar } from '../common/RatingBar';
import { ScoreMeter } from '../common/ScoreMeter';
import { getTierForName } from '../../utils/tierLookup';

export function TitanCard({ titan, onClick }) {
  const tier = getTierForName(titan.name, 'Titans');

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '2px' }}>
            <h3 style={{ fontSize: '20px', color: 'var(--purple)', margin: 0 }}>{titan.name}</h3>
            {tier && (
              <span className={`tier-badge-${tier.toLowerCase()}`} style={{
                fontSize: '11px',
                fontWeight: 'bold',
                padding: '1px 6px',
                borderRadius: '4px',
                background: `var(--tier-${tier.toLowerCase()}-bg)`,
                color: `var(--tier-${tier.toLowerCase()})`,
                border: `1px solid var(--tier-${tier.toLowerCase()}-border)`,
                textTransform: 'uppercase'
              }}>
                {tier} Tier
              </span>
            )}
          </div>
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
