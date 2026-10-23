import { sortRoles } from '../../utils/roles';
import { useEffect } from 'react';
import { X } from 'lucide-react';
import { useMemo } from 'react';
import weaponsDpsData from '../../data/weapons_dps.json';
import robotGuideData from '../../data/robot_guide.json';
import { RatingBar } from './RatingBar';
import { ScoreMeter } from './ScoreMeter';
import { getTierForName, getFootnoteText, stripTagsAndAsterisks } from '../../utils/tierLookup';
import { getItemImage, getRoleIcon, getUnitKey } from '../../utils/imageUtils';

// Pre-compute lookup data outside the component to avoid recreating it on every render.
const weaponsList = weaponsDpsData ? Object.values(weaponsDpsData).flat() : [];
const precomputedWeapons = weaponsList.map(w => ({
  ...w,
  lowerName: w.name.toLowerCase()
}));

const precomputedRobots = robotGuideData?.robots ? robotGuideData.robots.map(r => {
  const cleanName = stripTagsAndAsterisks(r.name).toLowerCase();
  return {
    ...r,
    cleanName,
    isUe: cleanName.startsWith('ue ')
  };
}) : [];

const precomputedTitans = robotGuideData?.titans ? robotGuideData.titans.map(t => {
  const cleanName = stripTagsAndAsterisks(t.name).toLowerCase();
  return {
    ...t,
    cleanName,
    isUe: cleanName.startsWith('ue ')
  };
}) : [];

const TAG_EMOJIS = ['👥', '‼️', '⬆️', '⬇️', '👁️', '⬆', '⬇', '👁'];
const TAG_REGEX = /(👥|‼️|⬆️|⬇️|👁️|⬆|⬇|👁)\s*([\s\S]*?)(?=(?:👥|‼️|⬆️|⬇️|👁️|⬆|⬇|👁|$))/gu;

function parseRationaleAndTags(rawDescription) {
  if (!rawDescription) {
    return { mainRationale: '', tagNotes: [] };
  }

  // Find the first index where any of the tag emojis appear
  let firstTagIndex = -1;
  for (let i = 0; i < rawDescription.length; i++) {
    for (const tag of TAG_EMOJIS) {
      if (rawDescription.startsWith(tag, i)) {
        firstTagIndex = i;
        break;
      }
    }
    if (firstTagIndex !== -1) break;
  }

  if (firstTagIndex === -1) {
    return { mainRationale: rawDescription.trim(), tagNotes: [] };
  }

  const mainRationale = rawDescription.slice(0, firstTagIndex).trim();
  const tagsSegment = rawDescription.slice(firstTagIndex);

  const tagNotes = [];
  TAG_REGEX.lastIndex = 0;
  let match;
  while ((match = TAG_REGEX.exec(tagsSegment)) !== null) {
    const tagEmoji = match[1];
    const text = match[2].trim();
    if (text || tagEmoji) {
      tagNotes.push({ tag: tagEmoji, text });
    }
  }

  return { mainRationale: mainRationale || rawDescription.trim(), tagNotes };
}

export function DetailModal({ selectedItem, onClose }) {
  const tier = useMemo(() => {
    if (!selectedItem) return null;
    if (selectedItem.type !== 'Robots' && selectedItem.type !== 'Titans') return null;
    return getTierForName(selectedItem.name, selectedItem.type);
  }, [selectedItem]);

  const dpsInfo = useMemo(() => {
    if (!selectedItem || !selectedItem.type.toLowerCase().includes('weapons')) return null;
    const parts = selectedItem.name.split(',').map(p => stripTagsAndAsterisks(p).toLowerCase());
    
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
    const cleanSelected = stripTagsAndAsterisks(selectedItem.name).toLowerCase();
    const isSelectedUe = cleanSelected.startsWith('ue ');

    // Try exact match first
    const exact = precomputedRobots.find(r => getUnitKey(r.name) === getUnitKey(selectedItem.name));
    if (exact) return exact;

    return precomputedRobots.find(r => {
      if (isSelectedUe !== r.isUe) return false;
      return cleanSelected.includes(r.cleanName);
    });
  }, [selectedItem]);

  const titan = useMemo(() => {
    if (!selectedItem || selectedItem.type !== 'Titans') return null;
    const cleanSelected = stripTagsAndAsterisks(selectedItem.name).toLowerCase();
    const isSelectedUe = cleanSelected.startsWith('ue ');

    // Try exact match first
    const exact = precomputedTitans.find(t => getUnitKey(t.name) === getUnitKey(selectedItem.name));
    if (exact) return exact;

    return precomputedTitans.find(t => {
      if (isSelectedUe !== t.isUe) return false;
      return cleanSelected.includes(t.cleanName);
    });
  }, [selectedItem]);

  const bgImage = useMemo(() => {
    if (!selectedItem) return null;
    return getItemImage(selectedItem.name, selectedItem.type);
  }, [selectedItem]);

  const { mainRationale, tagNotes } = useMemo(() => {
    return parseRationaleAndTags(selectedItem?.data?.description);
  }, [selectedItem?.data?.description]);

  useEffect(() => {
    if (!selectedItem) return;
    const origOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = origOverflow;
    };
  }, [selectedItem, onClose]);

  if (!selectedItem) return null;
  const isTierList = selectedItem.routeId === 'tiers';

  return (
    <div 
      className="modal-overlay" 
      onClick={onClose} 
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="modal-title"
    >
      <div className="modal-content text-left" onClick={(e) => e.stopPropagation()}>
        {bgImage && (
          <div className="modal-faded-bg" aria-hidden="true">
            <img
              src={bgImage}
              alt=""
              className="modal-faded-img"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
            <div className="modal-faded-gradient" />
          </div>
        )}
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
            <h3 id="modal-title" className="modal-title">{selectedItem.name}</h3>
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
            <p style={{ color: 'var(--text-primary)', fontSize: '14.5px', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-line' }}>
              {mainRationale}
            </p>

            {/* Tag explanations listed below rationale */}
            {tagNotes.length > 0 && (
              <div style={{ marginTop: '14px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>
                  Meta Tag Notes:
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {tagNotes.map((note, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        gap: '10px',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid var(--border-light)',
                        alignItems: 'flex-start'
                      }}
                    >
                      <span style={{ fontSize: '18px', lineHeight: 1, flexShrink: 0 }}>{note.tag}</span>
                      <span style={{ fontSize: '13.5px', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                        {note.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
                    <span className="detail-field-caption">BURST DPS</span>
                    <span className="detail-stat-value">
                      {parseFloat(dpsInfo.burst_dps) ? Math.round(parseFloat(dpsInfo.burst_dps)).toLocaleString() : dpsInfo.burst_dps}
                    </span>
                  </div>
                  <div>
                    <span className="detail-field-caption">CYCLE DPS</span>
                    <span className="detail-stat-value">
                      {parseFloat(dpsInfo.cycle_dps) ? Math.round(parseFloat(dpsInfo.cycle_dps)).toLocaleString() : dpsInfo.cycle_dps}
                    </span>
                  </div>
                  <div>
                    <span className="detail-field-caption">RANGE</span>
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>{dpsInfo.range}</span>
                  </div>
                  {dpsInfo.notes && (
                    <div style={{ gridColumn: 'span 2', marginTop: '8px' }}>
                      <span className="detail-field-caption">DPS CALC NOTES</span>
                      <p className="guide-note-text">{dpsInfo.notes}</p>
                    </div>
                  )}
                </>
              ) : null}
            </div>
          )}

          {/* For robots */}
          {selectedItem.type === 'Robots' && (
            <div className="detail-section">
              {rob ? (
                <>
                  <div className="detail-summary-row">
                    <div>
                      <span className="detail-field-label">{isTierList ? 'Main role' : 'Value rating'}</span>
                      {isTierList ? <span className="role-badge main">{rob.roles?.find(role => role.type === 'main')?.role || 'Unassigned'}</span> : <RatingBar rating={rob.value_rating} unitType="robot" />}
                    </div>
                    {tier && isTierList && (
                      <div>
                        <span className="detail-field-label">Tier</span>
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
                      <span className="detail-field-label">Class:</span>
                      <span className="role-badge" style={{ display: 'inline-flex', padding: '2px 8px', background: 'rgba(6, 182, 212, 0.1)', color: 'var(--cyan)', borderColor: 'rgba(6, 182, 212, 0.2)', marginTop: '4px' }}>Robot</span>
                    </div>
                  </div>
                  {rob.roles && rob.roles.length > 0 && (
                    <div className="space-below-16">
                      <span className="detail-role-label">{isTierList ? 'Subroles' : 'Roles'}</span>
                      <div className="detail-role-list">
                        {sortRoles(rob.roles).filter(role => !isTierList || role.type !== 'main').map(role => {
                          if (role.type === 'none') return null;
                          const tooltipText = getFootnoteText(role.footnote, robotGuideData?.footnotes);
                          const roleIcon = role.type === 'main' ? getRoleIcon(role.role) : null;
                          return (
                            <span
                              key={role.role}
                              className={`detail-role-badge role-badge ${role.type}`}
                              title={tooltipText}
                            >
                              {roleIcon && <img src={roleIcon} alt="" className="icon-13" />}
                              {role.role}
                              {role.footnote && <sup className="detail-footnote">{role.footnote}</sup>}
                            </span>
                          );
                        })}
                      </div>
                      {rob.roles.some(r => r.footnote) && (
                        <div className="detail-role-notes">
                          {rob.roles
                            .filter(r => r.footnote)
                            .map(r => {
                              const fText = getFootnoteText(r.footnote, robotGuideData?.footnotes);
                              return (
                                <span key={r.role} className="detail-role-note">
                                  {r.footnote} {fText.replace(/^\*+/, '').trim()}
                                </span>
                              );
                            })}
                        </div>
                      )}
                    </div>
                  )}
                  {!isTierList && <>
                  <span className="detail-ratings-label">Attribute ratings</span>
                  <div className="robot-scores detail-ratings" >
                    <ScoreMeter label="Longevity" score={rob.scores.longevity} options={{ min: 0, max: 10 }} />
                    <ScoreMeter label="Lethality" score={rob.scores.lethality} options={{ min: 0, max: 10 }} />
                    <ScoreMeter label="Mobility" score={rob.scores.mobility} options={{ min: 0, max: 10 }} />
                    <ScoreMeter label="Utility" score={rob.scores.utility} options={{ min: 0, max: 10 }} />
                    <ScoreMeter label="Accessibility" score={rob.scores.accessibility} options={{ min: 0, max: 10 }} />
                    <ScoreMeter label="Overall Score" score={rob.scores.overall} options={{ min: 0, max: 50 }} />
                  </div>
                  </>}
                </>
              ) : null}
            </div>
          )}

          {/* For titans */}
          {selectedItem.type === 'Titans' && (
            <div className="detail-section">
              {titan ? (
                <>
                  <div className="detail-summary-row">
                    <div>
                      <span className="detail-field-label">{isTierList ? 'Main role' : 'Value rating'}</span>
                      {isTierList ? <span className="role-badge main">{titan.roles?.find(role => role.type === 'main')?.role || 'Unassigned'}</span> : <RatingBar rating={titan.value_rating} unitType="titan" />}
                    </div>
                    {tier && isTierList && (
                      <div>
                        <span className="detail-field-label">Tier</span>
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
                      <span className="detail-field-label">Class:</span>
                      <span className="role-badge" style={{ display: 'inline-flex', padding: '2px 8px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--purple)', borderColor: 'rgba(59, 130, 246, 0.2)', marginTop: '4px' }}>Titan</span>
                    </div>
                  </div>
                  {titan.roles && titan.roles.length > 0 && (
                    <div className="space-below-16">
                      <span className="detail-role-label">{isTierList ? 'Subroles' : 'Roles'}</span>
                      <div className="detail-role-list">
                        {sortRoles(titan.roles).filter(role => !isTierList || role.type !== 'main').map(role => {
                          if (role.type === 'none') return null;
                          const tooltipText = getFootnoteText(role.footnote, robotGuideData?.footnotes);
                          const roleIcon = role.type === 'main' ? getRoleIcon(role.role) : null;
                          return (
                            <span
                              key={role.role}
                              className={`detail-role-badge role-badge ${role.type}`}
                              title={tooltipText}
                            >
                              {roleIcon && <img src={roleIcon} alt="" className="icon-13" />}
                              {role.role}
                              {role.footnote && <sup className="detail-footnote">{role.footnote}</sup>}
                            </span>
                          );
                        })}
                      </div>
                      {titan.roles.some(r => r.footnote) && (
                        <div className="detail-role-notes">
                          {titan.roles
                            .filter(r => r.footnote)
                            .map(r => {
                              const fText = getFootnoteText(r.footnote, robotGuideData?.footnotes);
                              return (
                                <span key={r.role} className="detail-role-note">
                                  {r.footnote} {fText.replace(/^\*+/, '').trim()}
                                </span>
                              );
                            })}
                        </div>
                      )}
                    </div>
                  )}
                  {!isTierList && <>
                  <span className="detail-ratings-label">Attribute ratings</span>
                  <div className="robot-scores detail-ratings" >
                    <ScoreMeter label="Longevity" score={titan.scores.longevity} options={{ min: 0, max: 10 }} />
                    <ScoreMeter label="Lethality" score={titan.scores.lethality} options={{ min: 0, max: 10 }} />
                    <ScoreMeter label="Mobility" score={titan.scores.mobility} options={{ min: 0, max: 10 }} />
                    <ScoreMeter label="Utility" score={titan.scores.utility} options={{ min: 0, max: 10 }} />
                    <ScoreMeter label="Accessibility" score={titan.scores.accessibility} options={{ min: 0, max: 10 }} />
                    <ScoreMeter label="Overall Score" score={titan.scores.overall} options={{ min: 0, max: 50 }} />
                  </div>
                  </>}
                </>
              ) : null}
            </div>
          )}

          {/* For specializations */}
          {selectedItem.type === 'Specialization' && selectedItem.data?.slots && (
            <div className="detail-section">
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '12px', textTransform: 'uppercase' }}>
                Recommended Slots:
              </span>
              <div className="stack-12">
                {selectedItem.data.slots.map((slot, slidx) => (
                  <div className="spec-slot-box" key={slidx} style={{ marginTop: '0px' }}>
                    <div className="spec-slot-title" style={{ color: selectedItem.data.isTitan ? 'var(--purple)' : 'var(--cyan)' }}>
                      <img src="/icons/module_old_gold.png" alt="" className="icon-18" />
                      {slot.name}
                    </div>
                    <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '4px 0 0 0', whiteSpace: 'pre-line' }}>
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
