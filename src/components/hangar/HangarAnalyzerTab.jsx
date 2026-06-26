import { useState, useMemo } from 'react';
import { X } from 'lucide-react';
import { RatingBar } from '../common/RatingBar';
import { ScoreMeter } from '../common/ScoreMeter';
import { HangarSelectorModal } from './HangarSelectorModal';
import tiersData from '../../data/tiers.json';
import robotGuideData from '../../data/robot_guide.json';

const TIER_VALUES = { X: 9, S: 8, A: 7, B: 6, C: 5, D: 4, E: 3, F: 2, Z: 1 };
const REVERSE_TIER_VALUES = { 9: 'X', 8: 'S', 7: 'A', 6: 'B', 5: 'C', 4: 'D', 3: 'E', 2: 'F', 1: 'Z' };

// Build a lookup cache once since tiersData is static
const tierLookupCache = {};
if (tiersData) {
  for (const [category, catData] of Object.entries(tiersData)) {
    tierLookupCache[category] = new Map();
    for (const [tierLetter, tierObj] of Object.entries(catData)) {
      if (tierObj.items) {
        for (const item of tierObj.items) {
          if (item.name) {
            const names = item.name.split(',').map(n => n.trim().toLowerCase());
            for (const n of names) {
              tierLookupCache[category].set(n, tierLetter);
            }
          }
        }
      }
    }
  }
}

const getTierForName = (name, category) => {
  if (!name || !tierLookupCache[category]) return null;
  return tierLookupCache[category].get(name.toLowerCase()) || null;
};

const STATUS_COLORS = {
  MET: {
    color: '#10b981',
    bg: 'rgba(16, 185, 129, 0.1)',
    text: 'Met'
  },
  UNDERFILLED: {
    color: '#fbbf24',
    bg: 'rgba(251, 191, 36, 0.1)',
    text: 'Underfilled'
  },
  MISSING: {
    color: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.1)',
    text: 'Missing'
  }
};

const CORE_ROLES_CONFIG = [
  { name: 'Support', target: 2, key: 'Support' },
  { name: 'Beacon Runner', target: 1, key: 'Beacon Runner' },
  { name: 'Midrange', target: 2, key: 'Midrange' },
  { name: 'Tank-buster', target: 1, key: 'Tank-buster' }
];

const TOTAL_CORE_TARGETS = CORE_ROLES_CONFIG.reduce((sum, role) => sum + role.target, 0);

export function HangarAnalyzerTab() {
  const [hangarRobots, setHangarRobots] = useState([null, null, null, null, null]);
  const [hangarTitan, setHangarTitan] = useState(null);
  const [activeSlot, setActiveSlot] = useState(null); // null, or 0-4 for robots, 5 for titan
  const [showSelectorModal, setShowSelectorModal] = useState(false);
  const [selectorSearchQuery, setSelectorSearchQuery] = useState('');

  const hangarAnalysis = useMemo(() => {
    const rolesList = ['Support', 'Tank-buster', 'Sniper', 'Midrange', 'Brawler', 'Beacon Runner', 'Assassin'];
    const scores = {};
    rolesList.forEach(r => {
      scores[r] = 0;
    });

    let selectedCount = 0;
    hangarRobots.forEach(robot => {
      if (robot) {
        selectedCount++;
        if (robot.roles) {
          robot.roles.forEach(roleObj => {
            const rName = roleObj.role;
            if (scores[rName] !== undefined) {
              if (roleObj.type === 'primary') {
                scores[rName] += 1.0;
              } else if (roleObj.type === 'secondary') {
                scores[rName] += 0.5;
              }
            }
          });
        }
      }
    });

    const coreMetCount = CORE_ROLES_CONFIG.reduce((sum, role) => {
      const score = scores[role.key] || 0;
      return sum + Math.min(role.target, score);
    }, 0);
    const corePercent = Math.round((coreMetCount / TOTAL_CORE_TARGETS) * 100);
    
    let alignmentColor = STATUS_COLORS.MISSING.color;
    if (corePercent >= 100) alignmentColor = STATUS_COLORS.MET.color;
    else if (corePercent >= 50) alignmentColor = STATUS_COLORS.UNDERFILLED.color;

    return {
      scores,
      selectedCount,
      coreMetCount,
      corePercent,
      alignmentColor
    };
  }, [hangarRobots]);

  const averageTier = useMemo(() => {
    let sum = 0;
    let count = 0;
    
    hangarRobots.forEach(robot => {
      if (robot) {
        const tier = getTierForName(robot.name, 'Robots');
        if (tier && TIER_VALUES[tier] !== undefined) {
          sum += TIER_VALUES[tier];
          count++;
        }
      }
    });
    
    if (hangarTitan) {
      const tier = getTierForName(hangarTitan.name, 'Titans');
      if (tier && TIER_VALUES[tier] !== undefined) {
        sum += TIER_VALUES[tier];
        count++;
      }
    }
    
    if (count === 0) return 'N/A';
    const avg = Math.round(sum / count);
    return REVERSE_TIER_VALUES[avg] || 'N/A';
  }, [hangarRobots, hangarTitan]);

  const handleOpenSelector = (slotIndex) => {
    setActiveSlot(slotIndex);
    setShowSelectorModal(true);
  };

  const handleCloseSelector = () => {
    setShowSelectorModal(false);
    setSelectorSearchQuery('');
  };

  const handleSelectUnit = (unit) => {
    if (activeSlot === 5) {
      setHangarTitan(unit);
    } else {
      const newHangar = [...hangarRobots];
      newHangar[activeSlot] = unit;
      setHangarRobots(newHangar);
    }
    handleCloseSelector();
  };

  const handleClearSlot = (slotIndex, e) => {
    e.stopPropagation();
    if (slotIndex === 5) {
      setHangarTitan(null);
    } else {
      const newHangar = [...hangarRobots];
      newHangar[slotIndex] = null;
      setHangarRobots(newHangar);
    }
  };

  return (
    <div className="animate-fade-in text-left">
      <div className="hero-banner" style={{ padding: '24px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '28px', marginBottom: '8px' }}>Hangar Analyzer</h2>
        <p style={{ margin: '0 auto' }}>
          Get a general idea of how strong your hangar is.
        </p>
      </div>

      {/* Slots grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {[0, 1, 2, 3, 4].map(idx => {
          const item = hangarRobots[idx];
          return item ? (
            <div 
              className="glass-panel glass-panel-hover" 
              key={idx}
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                padding: '16px', 
                minHeight: '180px', 
                borderRadius: '12px',
                position: 'relative',
                border: '1px solid var(--border-light)',
                background: 'rgba(15, 18, 30, 0.45)'
              }}
            >
              <button 
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onClick={(e) => handleClearSlot(idx, e)}
                title="Clear slot"
              >
                <X size={14} />
              </button>

              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>
                Robot Slot {idx + 1}
              </span>

              <h4 style={{ fontSize: '16px', color: 'var(--cyan)', margin: '0 0 6px 0', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', maxWidth: '140px' }} title={item.name}>
                {item.name}
              </h4>

              <div style={{ display: 'flex', width: '100%', marginBottom: '10px' }}>
                <RatingBar rating={item.value_rating} unitType="robot" />
              </div>

              {item.roles && item.roles.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: 'auto' }}>
                  {item.roles.map(r => {
                    const tooltipText = r.footnote ? robotGuideData?.footnotes?.[parseInt(r.footnote) - 1] || r.footnote : '';
                    return (
                      <span
                        key={r.role}
                        className={`role-badge ${r.type}`}
                        style={{ fontSize: '10px', padding: '1px 6px', display: 'inline-block', width: 'fit-content' }}
                        title={tooltipText}
                      >
                        {r.role}{r.footnote && <sup style={{ marginLeft: '2px' }}>*</sup>} {r.type === 'primary' ? '★' : '☆'}
                      </span>
                    );
                  })}
                </div>
              ) : (
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 'auto' }}>No specific roles</span>
              )}
            </div>
          ) : (
            <div 
              className="glass-panel glass-panel-hover" 
              key={idx}
              style={{ 
                border: '2px dashed var(--border-light)', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                padding: '24px', 
                minHeight: '180px', 
                cursor: 'pointer',
                borderRadius: '12px',
                transition: 'all 0.3s ease'
              }}
              onClick={() => handleOpenSelector(idx)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleOpenSelector(idx);
                }
              }}
              tabIndex={0}
              role="button"
              aria-label={`Select robot for slot ${idx + 1}`}
            >
              <div style={{ fontSize: '32px', color: 'var(--text-muted)', marginBottom: '8px' }}>+</div>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>ROBOT SLOT {idx + 1}</span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Click to select</span>
            </div>
          );
        })}

        {/* Titan slot */}
        {hangarTitan ? (
          <div 
            className="glass-panel glass-panel-hover" 
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              padding: '16px', 
              minHeight: '180px', 
              borderRadius: '12px',
              position: 'relative',
              border: '1px solid rgba(59, 130, 246, 0.4)',
              background: 'rgba(59, 130, 246, 0.05)'
            }}
          >
            <button 
              style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onClick={(e) => handleClearSlot(5, e)}
              title="Clear slot"
            >
              <X size={14} />
            </button>

            <span style={{ fontSize: '11px', color: 'var(--purple)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>
              Titan Slot
            </span>

            <h4 style={{ fontSize: '16px', color: 'var(--purple)', margin: '0 0 6px 0', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', maxWidth: '140px' }} title={hangarTitan.name}>
              {hangarTitan.name}
            </h4>

            <div style={{ display: 'flex', width: '100%', marginBottom: '10px' }}>
              <RatingBar rating={hangarTitan.value_rating} unitType="titan" />
            </div>
          </div>
        ) : (
          <div 
            className="glass-panel glass-panel-hover" 
            style={{ 
              border: '2px dashed rgba(59, 130, 246, 0.4)', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              padding: '24px', 
              minHeight: '180px', 
              cursor: 'pointer',
              borderRadius: '12px',
              transition: 'all 0.3s ease',
              background: 'rgba(59, 130, 246, 0.02)'
            }}
            onClick={() => handleOpenSelector(5)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleOpenSelector(5);
              }
            }}
            tabIndex={0}
            role="button"
            aria-label="Select Titan"
          >
            <div style={{ fontSize: '32px', color: 'var(--purple)', marginBottom: '8px' }}>+</div>
            <span style={{ fontSize: '13px', color: 'var(--purple)', fontWeight: 700 }}>TITAN SLOT</span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Click to select</span>
          </div>
        )}
      </div>

      {/* Analysis Dashboard */}
      {(hangarAnalysis.selectedCount > 0 || hangarTitan !== null) ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '32px', textAlign: 'left' }} className="responsive-split">
          
          {/* Left Panel: Role Strength Profiles */}
          <div className="glass-panel">
            <h3 style={{ fontSize: '20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--cyan)' }}>
              <img src="/icons/robot_gold.png" alt="" style={{ width: '20px', height: '20px', objectFit: 'contain' }} /> Hangar Roles Profile
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
              <img src="/icons/hint_operation.png" alt="" style={{ width: '20px', height: '20px', objectFit: 'contain' }} /> Hangar Rating
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

              {/* Additional Roles Recommendation Note */}
              {(() => {
                const supportTarget = CORE_ROLES_CONFIG.find(r => r.key === 'Support')?.target || 2;
                const tankBusterTarget = CORE_ROLES_CONFIG.find(r => r.key === 'Tank-buster')?.target || 1;
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
                    - Additional <strong>1x Support</strong> (Current: {supportScore.toFixed(1)} / {supportTarget + 1})<br />
                    - Additional <strong>1x Tank-buster</strong> (Current: {tankBusterScore.toFixed(1)} / {tankBusterTarget + 1})
                  </div>
                );
              })()}
            </div>
          </div>

        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '40px', marginTop: '32px', color: 'var(--text-muted)', textAlign: 'center' }}>
          Fill out the hangar analyzer above for automated feedback.
        </div>
      )}

      {/* Selector Modal Overlay */}
      {showSelectorModal && (
        <HangarSelectorModal
          activeSlot={activeSlot}
          selectorSearchQuery={selectorSearchQuery}
          setSelectorSearchQuery={setSelectorSearchQuery}
          onClose={handleCloseSelector}
          onSelect={handleSelectUnit}
        />
      )}
    </div>
  );
}
