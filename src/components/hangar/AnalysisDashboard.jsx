import { ScoreMeter } from '../common/ScoreMeter';

export function AnalysisDashboard({
  hangarAnalysis,
  averageTier,
  CORE_ROLES_CONFIG,
  STATUS_COLORS,
  SUPPORT_TARGET,
  TANK_BUSTER_TARGET
}) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '32px', textAlign: 'left' }} className="responsive-split">

      {/* Left Panel: Role Strength Profiles */}
      <div className="glass-panel">
        <h3 style={{ fontSize: '20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--cyan)' }}>
          <img src="/icons/robot_gold.png" alt="" style={{ width: '26px', height: '26px', objectFit: 'contain' }} /> Hangar Roles Profile
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {Object.keys(hangarAnalysis.scores).map(role => {
            const score = hangarAnalysis.scores[role];
            const percentage = Math.min(100, (score / 3.0) * 100);
            const barColor = score >= 1.5 ? 'var(--cyan)' : score >= 0.5 ? '#3b82f6' : 'rgba(255,255,255,0.1)';
            return (
              <div key={role} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                  <span style={{ fontWeight: 600, color: score > 0 ? '#fff' : 'var(--text-muted)' }}>{role}</span>
                  <span style={{
                    fontWeight: 700,
                    color: score >= 1.5 ? 'var(--cyan)' : score >= 0.5 ? '#3b82f6' : 'var(--text-muted)',
                    background: score > 0 ? 'rgba(255,255,255,0.05)' : 'none',
                    padding: '2px 8px',
                    borderRadius: '4px'
                  }}>
                    {score.toFixed(1)}
                  </span>
                </div>
                <div style={{ height: '8px', background: 'rgba(0,0,0,0.2)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${percentage}%`,
                    height: '100%',
                    background: barColor,
                    borderRadius: '4px',
                    boxShadow: score > 0 ? `0 0 8px ${barColor}` : 'none',
                    transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Panel: Synergy Evaluation & Advice */}
      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <h3 style={{ fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--purple)' }}>
          <img src="/icons/hint_operation.png" alt="" style={{ width: '26px', height: '26px', objectFit: 'contain' }} /> Hangar Rating
        </h3>

        {/* Alignment Score Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          background: 'rgba(0,0,0,0.2)',
          padding: '16px',
          borderRadius: '12px',
          border: `1px solid ${hangarAnalysis.alignmentColor}40`
        }}>
          <div style={{
            fontSize: '18px',
            fontWeight: 900,
            color: hangarAnalysis.alignmentColor,
            textShadow: `0 0 12px ${hangarAnalysis.alignmentColor}`,
            width: '68px',
            height: '68px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: `${hangarAnalysis.alignmentColor}10`,
            borderRadius: '50%',
            border: `3px solid ${hangarAnalysis.alignmentColor}`,
            flexShrink: 0
          }}>
            {hangarAnalysis.corePercent}%
          </div>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', display: 'block' }}>Role Alignment</span>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#fff', lineHeight: 1.4 }}>
              Core Hangar Role coverage compared to recommended target values.
            </p>
          </div>
        </div>

        {/* Average Tier Badge */}
        {averageTier !== 'N/A' && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            background: 'rgba(0,0,0,0.2)',
            padding: '16px',
            borderRadius: '12px',
            border: `1px solid var(--tier-${averageTier.toLowerCase()}-border)`
          }}>
            <div style={{
              fontSize: '24px',
              fontWeight: 900,
              color: `var(--tier-${averageTier.toLowerCase()})`,
              textShadow: `0 0 12px var(--tier-${averageTier.toLowerCase()})`,
              width: '68px',
              height: '68px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: `var(--tier-${averageTier.toLowerCase()}-bg)`,
              borderRadius: '50%',
              border: `3px solid var(--tier-${averageTier.toLowerCase()}-border)`,
              flexShrink: 0
            }}>
              {averageTier}
            </div>
            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', display: 'block' }}>Average Hangar Tier</span>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#fff', lineHeight: 1.4 }}>
                The average strength tier of active robots and titans in your hangar.
              </p>
            </div>
          </div>
        )}

        {/* Core Hangar Roles Profile */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', borderBottom: '1px solid var(--border-light)', paddingBottom: '6px' }}>
            Core Hangar Roles
          </div>

          {CORE_ROLES_CONFIG.map(role => {
            const current = hangarAnalysis.scores[role.key] || 0;
            const percentage = Math.min(100, (current / role.target) * 100);

            let status = STATUS_COLORS.MISSING;
            if (current >= role.target) {
              status = STATUS_COLORS.MET;
            } else if (current > 0) {
              status = STATUS_COLORS.UNDERFILLED;
            }

            return (
              <ScoreMeter
                key={role.key}
                label={role.name}
                score={current}
                options={{
                  customValueLabel: `${current} / ${role.target}`,
                  customPercentage: percentage,
                  customFillColor: status.color,
                  customBadge: (
                    <span style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      color: status.color,
                      background: status.bg,
                      border: `1px solid ${status.color}30`
                    }}>
                      {status.text}
                    </span>
                  )
                }}
              />
            );
          })}
        </div>

        {/* Additional Hangar Roles */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', borderBottom: '1px solid var(--border-light)', paddingBottom: '6px' }}>
            Additional Hangar Roles
          </div>

          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
            Once you have upgraded ALL main hangar bots/weapons to MK2.1, build these dedicated option bots:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            {[
              { name: 'Assassin', key: 'Assassin' },
              { name: 'Brawler', key: 'Brawler' },
              { name: 'Sniper', key: 'Sniper' }
            ].map(role => {
              const current = hangarAnalysis.scores[role.key] || 0;
              const hasOne = current >= 1.0;
              const hasPartial = current > 0 && current < 1.0;

              let badgeColor = 'var(--text-muted)';
              let badgeBg = 'rgba(255,255,255,0.02)';
              let badgeText = current.toFixed(1);
              if (hasOne) {
                badgeColor = 'var(--purple)';
                badgeBg = 'rgba(59, 130, 246, 0.1)';
              } else if (hasPartial) {
                badgeColor = '#60a5fa';
                badgeBg = 'rgba(96, 165, 250, 0.1)';
              }

              return (
                <div
                  key={role.name}
                  style={{
                    background: badgeBg,
                    border: `1px solid ${hasOne || hasPartial ? badgeColor + '30' : 'var(--border-light)'}`,
                    padding: '10px',
                    borderRadius: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <span style={{ fontSize: '12px', color: hasOne || hasPartial ? 'var(--text-primary)' : 'var(--text-secondary)', textAlign: 'center' }}>{role.name}</span>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: badgeColor,
                    background: hasOne || hasPartial ? 'transparent' : 'rgba(255,255,255,0.05)',
                    padding: '2px 6px',
                    borderRadius: '4px'
                  }}>
                    {badgeText} / 1
                  </span>
                </div>
              );
            })}
          </div>

          {/* Titan Deployment Roles */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', borderBottom: '1px solid var(--border-light)', paddingBottom: '6px' }}>
              Titan Deployment Roles
            </div>

            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
              Deployment strategy configurations:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {[
                { name: 'Early Drop', key: 'Early Drop' },
                { name: 'Late Drop', key: 'Late Drop' }
              ].map(role => {
                const current = hangarAnalysis.scores[role.key] || 0;
                const hasOne = current >= 1.0;
                const hasPartial = current > 0 && current < 1.0;

                let badgeColor = 'var(--text-muted)';
                let badgeBg = 'rgba(255,255,255,0.02)';
                let badgeText = current.toFixed(1);
                if (hasOne) {
                  badgeColor = 'var(--purple)';
                  badgeBg = 'rgba(59, 130, 246, 0.1)';
                } else if (hasPartial) {
                  badgeColor = '#60a5fa';
                  badgeBg = 'rgba(96, 165, 250, 0.1)';
                }

                return (
                  <div
                    key={role.name}
                    style={{
                      background: badgeBg,
                      border: `1px solid ${hasOne || hasPartial ? badgeColor + '30' : 'var(--border-light)'}`,
                      padding: '10px',
                      borderRadius: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <span style={{ fontSize: '12px', color: hasOne || hasPartial ? 'var(--text-primary)' : 'var(--text-secondary)', textAlign: 'center' }}>{role.name}</span>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: badgeColor,
                      background: hasOne || hasPartial ? 'transparent' : 'rgba(255,255,255,0.05)',
                      padding: '2px 6px',
                      borderRadius: '4px'
                    }}>
                      {badgeText} / 1
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Additional Roles Recommendation Note */}
          {(() => {
            const supportScore = hangarAnalysis.scores['Support'] || 0;
            const tankBusterScore = hangarAnalysis.scores['Tank-buster'] || 0;

            return (
              <div style={{
                fontSize: '12.5px',
                color: 'var(--text-secondary)',
                background: 'rgba(255,255,255,0.02)',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid var(--border-light)',
                lineHeight: 1.6
              }}>
                <div style={{ fontWeight: 600, color: 'var(--cyan)', marginBottom: '6px' }}>Target Extension Options:</div>
                - Additional <strong>1x Support</strong> (Current: {supportScore.toFixed(1)} / {SUPPORT_TARGET + 1})<br />
                - Additional <strong>1x Tank-buster</strong> (Current: {tankBusterScore.toFixed(1)} / {TANK_BUSTER_TARGET + 1})
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
