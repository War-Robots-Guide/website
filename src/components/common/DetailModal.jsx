import { useEffect } from 'react';
import { X } from 'lucide-react';
import weaponsDpsData from '../../data/weapons_dps.json';
import robotGuideData from '../../data/robot_guide.json';
import { RatingBar } from './RatingBar';
import { ScoreMeter } from './ScoreMeter';

export function DetailModal({ selectedItem, onClose }) {
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
          {selectedItem.type.includes('Weapons') && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
              {(() => {
                // Try to search weapon in weapons_dps.json
                let dpsInfo = null;
                if (weaponsDpsData) {
                  Object.keys(weaponsDpsData).forEach(k => {
                    const found = weaponsDpsData[k].find(w => w.name.toLowerCase() === selectedItem.name.toLowerCase() || selectedItem.name.toLowerCase().includes(w.name.toLowerCase()));
                    if (found) dpsInfo = found;
                  });
                }
                if (dpsInfo) {
                  return (
                    <>
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
                  );
                }
                return null;
              })()}
            </div>
          )}

          {/* For robots */}
          {selectedItem.type === 'Robots' && (
            <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
              {(() => {
                const cleanSelected = selectedItem.name.replace(/\*+$/, '').trim().toLowerCase();
                const isSelectedUe = cleanSelected.startsWith('ue ');
                const rob = robotGuideData?.robots?.find(r => {
                  const cleanR = r.name.replace(/\*+$/, '').trim().toLowerCase();
                  const isR_Ue = cleanR.startsWith('ue ');
                  if (isSelectedUe !== isR_Ue) return false;
                  return cleanR === cleanSelected || cleanSelected.includes(cleanR);
                });
                if (rob) {
                  return (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <div>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Value rating</span>
                          <RatingBar rating={rob.value_rating} unitType="robot" />
                        </div>
                        <div>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>Class:</span>
                          <span className="role-badge" style={{ display: 'inline-flex', padding: '2px 8px', background: 'rgba(6, 182, 212, 0.1)', color: 'var(--cyan)', borderColor: 'rgba(6, 182, 212, 0.2)' }}>Robot</span>
                        </div>
                      </div>
                      {rob.roles && rob.roles.length > 0 && (
                        <div style={{ marginBottom: '16px' }}>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>Roles</span>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {rob.roles.map(role => {
                              if (role.type === 'none') return null;
                              return (
                                <span key={role.role} className={`role-badge ${role.type}`} style={{ display: 'inline-flex', padding: '2px 8px' }}>
                                  {role.role}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Attribute ratings</span>
                      <div className="robot-scores" style={{ border: 'none', padding: 0, margin: 0 }}>
                        <ScoreMeter label="Longevity" score={rob.scores.longevity} />
                        <ScoreMeter label="Lethality" score={rob.scores.lethality} />
                        <ScoreMeter label="Mobility" score={rob.scores.mobility} />
                        <ScoreMeter label="Utility" score={rob.scores.utility} />
                        <ScoreMeter label="Accessibility" score={rob.scores.accessibility} />
                        <ScoreMeter label="Overall Score" score={rob.scores.overall} />
                      </div>
                    </>
                  );
                }
                return null;
              })()}
            </div>
          )}

          {/* For titans */}
          {selectedItem.type === 'Titans' && (
            <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
              {(() => {
                const cleanSelected = selectedItem.name.replace(/\*+$/, '').trim().toLowerCase();
                const isSelectedUe = cleanSelected.startsWith('ue ');
                const titan = robotGuideData?.titans?.find(t => {
                  const cleanT = t.name.replace(/\*+$/, '').trim().toLowerCase();
                  const isT_Ue = cleanT.startsWith('ue ');
                  if (isSelectedUe !== isT_Ue) return false;
                  return cleanT === cleanSelected || cleanSelected.includes(cleanT);
                });
                if (titan) {
                  return (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <div>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Value rating</span>
                          <RatingBar rating={titan.value_rating} unitType="titan" />
                        </div>
                        <div>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>Class:</span>
                          <span className="role-badge" style={{ display: 'inline-flex', padding: '2px 8px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--purple)', borderColor: 'rgba(59, 130, 246, 0.2)' }}>Titan</span>
                        </div>
                      </div>
                      {titan.roles && titan.roles.length > 0 && (
                        <div style={{ marginBottom: '16px' }}>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>Roles</span>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {titan.roles.map(role => {
                              if (role.type === 'none') return null;
                              return (
                                <span key={role.role} className={`role-badge ${role.type}`} style={{ display: 'inline-flex', padding: '2px 8px' }}>
                                  {role.role}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Attribute ratings</span>
                      <div className="robot-scores" style={{ border: 'none', padding: 0, margin: 0 }}>
                        <ScoreMeter label="Longevity" score={titan.scores.longevity} />
                        <ScoreMeter label="Lethality" score={titan.scores.lethality} />
                        <ScoreMeter label="Mobility" score={titan.scores.mobility} />
                        <ScoreMeter label="Utility" score={titan.scores.utility} />
                        <ScoreMeter label="Accessibility" score={titan.scores.accessibility} />
                        <ScoreMeter label="Overall Score" score={titan.scores.overall} />
                      </div>
                    </>
                  );
                }
                return null;
              })()}
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
