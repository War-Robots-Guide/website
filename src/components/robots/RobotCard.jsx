import { RatingBar } from '../common/RatingBar';
import { ScoreMeter } from '../common/ScoreMeter';

export function RobotCard({ robot, onClick, robotGuideData }) {
  return (
    <div
      className="glass-panel glass-panel-hover robot-card"
      onClick={() => onClick(robot, 'Robots')}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(robot, 'Robots'); } }}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${robot.name}`}
    >
      <div className="robot-card-header">
        <div>
          <h3 style={{ fontSize: '20px', color: 'var(--cyan)' }}>{robot.name}</h3>
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
        <div className="robot-roles">
          {robot.roles.map(role => {
            const tooltipText = role.footnote ? robotGuideData?.footnotes?.[parseInt(role.footnote) - 1] || role.footnote : '';
            return (
              <span
                className={`role-badge ${role.type}`}
                key={role.role}
                title={tooltipText}
              >
                {role.role}
                {role.type === 'primary' && ' (Primary)'}
                {role.type === 'secondary' && ' (Secondary)'}
                {role.footnote && <sup style={{ color: 'var(--text-muted)', marginLeft: '2px' }}>*</sup>}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
