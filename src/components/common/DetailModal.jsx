import { useEffect } from 'react';
import { X } from 'lucide-react';
import { useMemo } from 'react';
import weaponsDpsData from '../../data/weapons_dps.json';
import robotGuideData from '../../data/robot_guide.json';
import { RatingBar } from './RatingBar';
import { ScoreMeter } from './ScoreMeter';
import { getTierForName, getFootnoteText } from '../../utils/tierLookup';
import { getOverallScoreRange } from '../../utils/ratingColors';

// Pre-compute lookup data outside the component to avoid recreating it on every render.
const weaponsList = weaponsDpsData ? Object.values(weaponsDpsData).flat() : [];
const precomputedWeapons = weaponsList.map(w => ({
  ...w,
  lowerName: w.name.toLowerCase()
}));

const precomputedRobots = robotGuideData?.robots ? robotGuideData.robots.map(r => {
  const cleanName = r.name.replace(/\*+$/, '').trim().toLowerCase();
  return {
    ...r,
    cleanName,
    isUe: cleanName.startsWith('ue ')
  };
}) : [];

const precomputedTitans = robotGuideData?.titans ? robotGuideData.titans.map(t => {
  const cleanName = t.name.replace(/\*+$/, '').trim().toLowerCase();
  return {
    ...t,
    cleanName,
    isUe: cleanName.startsWith('ue ')
  };
}) : [];

const { min: overallMin, max: overallMax } = getOverallScoreRange();

export function DetailModal({ selectedItem, onClose }) {
  const tier = useMemo(() => {
    if (!selectedItem) return null;
    if (selectedItem.type !== 'Robots' && selectedItem.type !== 'Titans') return null;
    return getTierForName(selectedItem.name, selectedItem.type);
  }, [selectedItem]);

  const dpsInfo = useMemo(() => {
    if (!selectedItem || !selectedItem.type.toLowerCase().includes('weapons')) return null;
    const parts = selectedItem.name.toLowerCase().split(',').map(p => p.replace(/\*+$/, '').trim());
    
    for (const part of parts) {
      if (!part) continue;
      
      const match = precomputedWeapons.find(w => {
        const wClean = w.lowerName.replace(/\s*\(.*\)/g, '').trim();
        return wClean === part || wClean.includes(part) || part.includes(wClean);
      });
      
      if (match) return match;
    }
    return null;
  }, [selectedItem]);

  const rob = useMemo(() => {
    if (!selectedItem || selectedItem.type !== 'Robots') return null;
    const cleanSelected = selectedItem.name.replace(/\*+$/, '').trim().toLowerCase();
    const isSelectedUe = cleanSelected.startsWith('ue ');

    // Try exact match first
    const exact = precomputedRobots.find(r => r.cleanName === cleanSelected);
    if (exact) return exact;

    return precomputedRobots.find(r => {
      if (isSelectedUe !== r.isUe) return false;
      return cleanSelected.includes(r.cleanName);
    });
  }, [selectedItem]);

  const titan = useMemo(() => {
    if (!selectedItem || selectedItem.type !== 'Titans') return null;
    const cleanSelected = selectedItem.name.replace(/\*+$/, '').trim().toLowerCase();
    const isSelectedUe = cleanSelected.startsWith('ue ');

    // Try exact match first
    const exact = precomputedTitans.find(t => t.cleanName === cleanSelected);
    if (exact) return exact;

    return precomputedTitans.find(t => {
      if (isSelectedUe !== t.isUe) return false;
      return cleanSelected.includes(t.cleanName);
    });
  }, [selectedItem]);

  useEffect(() => {
    if (!selectedItem) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItem, onClose]);

  if (!selectedItem) return null;

  return (
    <div 
      className="modal-overlay" 
      onClick={onClose} 
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="modal-title"
    >
      <div className="modal-content text-left" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <span 
              className="spec-class-tag" 
              style={{ 
                background: (selectedItem.type === 'Titans' || selectedItem.data?.isTitan) ? 'rgba(59, 130, 246, 0.1)' : 'rgba(6, 182, 212, 0.1)', 
                color: (selectedItem.type === 'Titans' || selectedItem.data?.isTitan) ? 'var(--purple)' : 'var(--cyan)', 
                borderColor: (selectedItem.type === 'Titans' || selectedItem.data?.isTitan) ? 'rgba(59, 130, 246, 0.2)' : 'rgba(6, 182, 212, 0.2)', 
                marginBottom: '4px', 
                display: 'inline-block' 
              }}
            >
              {selectedItem.type === 'Specialization' ? (selectedItem.data?.isTitan ? 'Titan Specialization' : 'Robot Specialization') : selectedItem.type}
            </span>
            <h3 id="modal-title" style={{ fontSize: '22px' }}>{selectedItem.name}</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>
        
        <div className="modal-body">
          {/* Detailed Reasoning */}
          <div style={{ marginBottom: '20px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>
              Rationale:
            </span>
            <p style={{ color: 'var(--text-primary)', fontSize: '14.5px', lineHeight: 1.6 }}>
              {selectedItem.data.description}
            </p>
          </div>

          {/* Extra context if available */}
          {/* For weapons */}
          {selectedItem.type.toLowerCase().includes('weapons') && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
              {dpsInfo ? (
                <>
                  <div style={{ gridColumn: 'span 2', marginBottom: '4px' }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Stats shown for</span>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--cyan)' }}>{dpsInfo.name}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>BURST DPS</span>
                    <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--cyan)' }}>
                      {parseFloat(dpsInfo.burst_dps) ? Math.round(parseFloat(dpsInfo.burst_dps)).toLocaleString() : dpsInfo.burst_dps}
                    </span>
                  </div>
                  <div>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>CYCLE DPS</span>
                    <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--cyan)' }}>
                      {parseFloat(dpsInfo.cycle_dps) ? Math.round(parseFloat(dpsInfo.cycle_dps)).toLocaleString() : dpsInfo.cycle_dps}
                    </span>
                  </div>
                  <div>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>RANGE</span>
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>{dpsInfo.range}</span>
                  </div>
                  {dpsInfo.notes && (
                    <div style={{ gridColumn: 'span 2', marginTop: '8px' }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>DPS CALC NOTES</span>
                      <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{dpsInfo.notes}</p>
                    </div>
                  )}
                </>
              ) : null}
            </div>
          )}

          {/* For robots */}
          {selectedItem.type === 'Robots' && (
            <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
              {rob ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Value rating</span>
                      <RatingBar rating={rob.value_rating} unitType="robot" />
                    </div>
                    {tier && (
                      <div>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Tier</span>
                        <span className={`tier-badge-${tier.toLowerCase()}`} style={{ 
                          display: 'inline-flex', 
                          padding: '2px 8px', 
                          fontWeight: 'bold',
                          fontSize: '11px',
                          borderRadius: '4px',
                          background: `var(--tier-${tier.toLowerCase()}-bg)`,
                          color: `var(--tier-${tier.toLowerCase()})`,
                          border: `1px solid var(--tier-${tier.toLowerCase()}-border)`,
                          textTransform: 'uppercase',
                          marginTop: '4px'
                        }}>{tier} Tier</span>
                      </div>
                    )}
                    <div>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Class:</span>
                      <span className="role-badge" style={{ display: 'inline-flex', padding: '2px 8px', background: 'rgba(6, 182, 212, 0.1)', color: 'var(--cyan)', borderColor: 'rgba(6, 182, 212, 0.2)', marginTop: '4px' }}>Robot</span>
                    </div>
                  </div>
                  {rob.roles && rob.roles.length > 0 && (
                    <div style={{ marginBottom: '16px' }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>Roles</span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {rob.roles.map(role => {
                          if (role.type === 'none') return null;
                          const tooltipText = getFootnoteText(role.footnote, robotGuideData?.footnotes);
                          return (
                            <span
                              key={role.role}
                              className={`role-badge ${role.type}`}
                              style={{ display: 'inline-flex', padding: '2px 8px', alignItems: 'center' }}
                              title={tooltipText}
                            >
                              {role.role}
                              {role.footnote && <sup style={{ color: 'var(--text-muted)', marginLeft: '2px' }}>{role.footnote}</sup>}
                            </span>
                          );
                        })}
                      </div>
                      {rob.roles.some(r => r.footnote) && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '8px' }}>
                          {rob.roles
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
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Attribute ratings</span>
                  <div className="robot-scores" style={{ border: 'none', padding: 0, margin: 0 }}>
                    <ScoreMeter label="Longevity" score={rob.scores.longevity} options={{ min: 0, max: 10 }} />
                    <ScoreMeter label="Lethality" score={rob.scores.lethality} options={{ min: 0, max: 10 }} />
                    <ScoreMeter label="Mobility" score={rob.scores.mobility} options={{ min: 0, max: 10 }} />
                    <ScoreMeter label="Utility" score={rob.scores.utility} options={{ min: 0, max: 10 }} />
                    <ScoreMeter label="Accessibility" score={rob.scores.accessibility} options={{ min: 0, max: 10 }} />
                     <ScoreMeter label="Overall Score" score={rob.scores.overall} options={{ min: overallMin, max: overallMax }} />
                  </div>
                </>
              ) : null}
            </div>
          )}

          {/* For titans */}
          {selectedItem.type === 'Titans' && (
            <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
              {titan ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Value rating</span>
                      <RatingBar rating={titan.value_rating} unitType="titan" />
                    </div>
                    {tier && (
                      <div>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Tier</span>
                        <span className={`tier-badge-${tier.toLowerCase()}`} style={{ 
                          display: 'inline-flex', 
                          padding: '2px 8px', 
                          fontWeight: 'bold',
                          fontSize: '11px',
                          borderRadius: '4px',
                          background: `var(--tier-${tier.toLowerCase()}-bg)`,
                          color: `var(--tier-${tier.toLowerCase()})`,
                          border: `1px solid var(--tier-${tier.toLowerCase()}-border)`,
                          textTransform: 'uppercase',
                          marginTop: '4px'
                        }}>{tier} Tier</span>
                      </div>
                    )}
                    <div>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Class:</span>
                      <span className="role-badge" style={{ display: 'inline-flex', padding: '2px 8px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--purple)', borderColor: 'rgba(59, 130, 246, 0.2)', marginTop: '4px' }}>Titan</span>
                    </div>
                  </div>
                  {titan.roles && titan.roles.length > 0 && (
                    <div style={{ marginBottom: '16px' }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>Roles</span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {titan.roles.map(role => {
                          if (role.type === 'none') return null;
                          const tooltipText = getFootnoteText(role.footnote, robotGuideData?.footnotes);
                          return (
                            <span
                              key={role.role}
                              className={`role-badge ${role.type}`}
                              style={{ display: 'inline-flex', padding: '2px 8px', alignItems: 'center' }}
                              title={tooltipText}
                            >
                              {role.role}
                              {role.footnote && <sup style={{ color: 'var(--text-muted)', marginLeft: '2px' }}>{role.footnote}</sup>}
                            </span>
                          );
                        })}
                      </div>
                      {titan.roles.some(r => r.footnote) && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '8px' }}>
                          {titan.roles
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
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Attribute ratings</span>
                  <div className="robot-scores" style={{ border: 'none', padding: 0, margin: 0 }}>
                    <ScoreMeter label="Longevity" score={titan.scores.longevity} options={{ min: 0, max: 10 }} />
                    <ScoreMeter label="Lethality" score={titan.scores.lethality} options={{ min: 0, max: 10 }} />
                    <ScoreMeter label="Mobility" score={titan.scores.mobility} options={{ min: 0, max: 10 }} />
                    <ScoreMeter label="Utility" score={titan.scores.utility} options={{ min: 0, max: 10 }} />
                    <ScoreMeter label="Accessibility" score={titan.scores.accessibility} options={{ min: 0, max: 10 }} />
                     <ScoreMeter label="Overall Score" score={titan.scores.overall} options={{ min: overallMin, max: overallMax }} />
                  </div>
                </>
              ) : null}
            </div>
          )}

          {/* For specializations */}
          {selectedItem.type === 'Specialization' && selectedItem.data?.slots && (
            <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '12px', textTransform: 'uppercase' }}>
                Recommended Slots:
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {selectedItem.data.slots.map((slot, slidx) => (
                  <div className="spec-slot-box" key={slidx} style={{ marginTop: '0px' }}>
                    <div className="spec-slot-title" style={{ color: selectedItem.data.isTitan ? 'var(--purple)' : 'var(--cyan)' }}>
                      <img src="/icons/module_old_gold.png" alt="" style={{ width: '18px', height: '18px', objectFit: 'contain' }} />
                      {slot.name}
                    </div>
                    <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '4px 0 0 0' }}>
                      {slot.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
