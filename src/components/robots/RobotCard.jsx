import { RatingBar } from '../common/RatingBar';
import { ScoreMeter } from '../common/ScoreMeter';
import { getTierForName, getFootnoteText } from '../../utils/tierLookup';

export function RobotCard({ robot, onClick, robotGuideData }) {
  const tier = getTierForName(robot.name, 'Robots');

  return (
    <div
      className="glass-panel glass-panel-hover robot-card"
      style={{ overflow: 'visible' }}
      onClick={() => onClick(robot, 'Robots')}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(robot, 'Robots'); } }}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${robot.name}`}
    >
      <div className="robot-card-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '2px' }}>
            <h3 style={{ fontSize: '20px', color: 'var(--cyan)', margin: 0 }}>{robot.name}</h3>
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
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{robot.sheet}</span>
        </div>
        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '2px', fontWeight: 600 }}>VALUE RATING</span>
          <RatingBar rating={robot.value_rating} unitType="robot" align="right" />
        </div>
      </div>

      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '8px 0' }}>
        {robot.comments}
      </p>

      {/* Scores bars */}
      <div className="robot-scores">
        <ScoreMeter label="Longevity" score={robot.scores.longevity} />
        <ScoreMeter label="Lethality" score={robot.scores.lethality} />
        <ScoreMeter label="Mobility" score={robot.scores.mobility} />
        <ScoreMeter label="Utility" score={robot.scores.utility} />
        <ScoreMeter label="Accessibility" score={robot.scores.accessibility} />
        <ScoreMeter label="Overall Score" score={robot.scores.overall} />
      </div>

      {/* Roles Badges */}
      {robot.roles && robot.roles.length > 0 && (
        <div className="robot-roles" style={{ display: 'block' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {robot.roles.map(role => {
              const tooltipText = getFootnoteText(role.footnote, robotGuideData?.footnotes);
              return (
                <span
                  className={`role-badge ${role.type}`}
                  key={role.role}
                  title={tooltipText}
                  style={{ display: 'inline-flex', alignItems: 'center' }}
                >
                  {role.role}
                  {role.type === 'primary' && ' (Primary)'}
                  {role.type === 'secondary' && ' (Secondary)'}
                  {role.footnote && <sup style={{ color: 'var(--text-muted)', marginLeft: '2px' }}>{role.footnote}</sup>}
                </span>
              );
            })}
          </div>
          {robot.roles.some(r => r.footnote) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '8px' }}>
              {robot.roles
                .filter(r => r.footnote)
                .map(r => {
                  const fText = getFootnoteText(r.footnote, robotGuideData?.footnotes);
                  return (
                    <span key={r.role} style={{ fontSize: '10.5px', color: 'var(--text-muted)', fontStyle: 'italic', lineHeight: 1.3 }}>
                      {r.footnote} {fText.replace(/^\*+/, '').trim()}
                    </span>
                  );
                })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
