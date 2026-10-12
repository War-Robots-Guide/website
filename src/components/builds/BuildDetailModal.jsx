import { useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { getTierForName } from '../../utils/tierLookup';
import {
  getRobotImage,
  getPilotImage,
  getDroneImage,
  getModuleImage,
  getWeaponImage,
} from '../../utils/imageUtils';

function parseCommaOrNewlineItems(text) {
  if (!text || text === 'N/A') return [];
  return text
    .split(/\n|\/|,/)
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.toLowerCase().startsWith('not recommended'));
}

export function BuildDetailModal({ build, onClose }) {
  useEffect(() => {
    if (!build) return;
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
  }, [build, onClose]);

  const bgImage = useMemo(() => {
    if (!build) return null;
    return getRobotImage(build.robot);
  }, [build]);

  const tier = useMemo(() => {
    if (!build) return null;
    return getTierForName(build.robot, 'Robots');
  }, [build]);

  const pilotImage = useMemo(() => {
    if (!build) return null;
    return getPilotImage(build.pilot);
  }, [build]);

  const droneList = useMemo(() => {
    if (!build?.drone_options || build.drone_options === 'N/A') return [];
    return build.drone_options
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean);
  }, [build]);

  const parsedModules = useMemo(() => {
    if (!build?.specialization) return [];
    const text = build.specialization;
    // Extract potential modules mentioned in text
    const moduleKeywords = [
      'Nuclear Amplifier', 'Titan Nuclear Amplifier',
      'Repair Amplifier', 'Titan Repair Amplifier',
      'Immune Amplifier', 'Titan Immune Amplifier',
      'Last Stand', 'Titan Last Stand',
      'Phase Shift', 'Repair Unit', 'Advanced Repair Unit',
      'Unstable Conduit', 'Lock Down Ammo', 'Death Mark',
      'Shieldbreaker', 'Quantum Radar', 'Quantum Sensor',
      'Robot Accelerator', 'Accelerator', 'Titan Accelerator',
      'Overdrive Unit', 'Overdrive', 'Titan Overdrive',
      'Anticontrol', 'Titan Anticontrol', 'Cannibal Reactor',
      'Heavy Armor Kit', 'Fortifier', 'Integrated Power Unit',
      'Titan Slayer', 'Rangefinder', 'Beacon Operator',
      'Cloaking Unit', 'Self Fix Unit'
    ];
    const found = [];
    const textLower = text.toLowerCase();
    for (const kw of moduleKeywords) {
      if (textLower.includes(kw.toLowerCase())) {
        if (!found.some(f => f.toLowerCase() === kw.toLowerCase() || kw.toLowerCase().includes(f.toLowerCase()))) {
          found.push(kw);
        }
      }
    }
    return found;
  }, [build]);

  const f2pWeaponList = useMemo(() => {
    if (!build?.f2p_weapons) return [];
    return parseCommaOrNewlineItems(build.f2p_weapons);
  }, [build]);

  const metaWeaponList = useMemo(() => {
    if (!build?.best_weapons) return [];
    return parseCommaOrNewlineItems(build.best_weapons);
  }, [build]);

  if (!build) return null;

  const isF2pNotRec = build.f2p_weapons?.toLowerCase().includes('not recommended');
  const tierKey = tier ? tier.toLowerCase() : 'z';

  return createPortal(
    <div 
      className="modal-overlay" 
      onClick={onClose} 
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="modal-title"
    >
      <div
        className="modal-content text-left"
        style={{
          maxWidth: '720px',
          position: 'relative',
          background: 'var(--bg-surface)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Faded Background Robot Artwork */}
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

        {/* Modal Header */}
        <div className="modal-header modal-layer-header" >
          <div>
            <div className="card-title-row">
              <h2 id="modal-title" style={{ fontSize: '24px', fontWeight: 800, color: '#fff', margin: 0 }}>
                {build.robot}
              </h2>
              {tier && (
                <span
                  className={`tier-badge-${tierKey}`}
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: `var(--tier-${tierKey}-bg)`,
                    color: `var(--tier-${tierKey})`,
                    border: `1px solid var(--tier-${tierKey}-border)`,
                    textTransform: 'uppercase',
                  }}
                >
                  {tier} Tier
                </span>
              )}
              {build.is_ultimate && (
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: 'rgba(234, 179, 8, 0.2)',
                    color: '#fbbf24',
                    border: '1px solid rgba(234, 179, 8, 0.4)',
                    textTransform: 'uppercase',
                  }}
                >
                  Ultimate
                </span>
              )}
            </div>

            <div className="row-center-8">
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--cyan)',
                  background: 'rgba(6, 182, 212, 0.1)',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  border: '1px solid rgba(6, 182, 212, 0.25)',
                }}
              >
                {build.parsed_build_name}
              </span>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body modal-layer-body" >
          
          {/* Top Gear Cards Grid (Pilot, Drone, Specialization) */}
          <div className="build-equipment-grid">
            
            {/* Pilot Card */}
            <div
              className="build-equipment-panel"
            >
              <span className="build-equipment-heading">
                <img src="/icons/pilot_gold.png" alt="" className="icon-18" />
                Pilot Option
              </span>
              <div className="row-center-14">
                <div className="build-equipment-image">
                  {pilotImage ? (
                    <img src={pilotImage} alt={build.parsed_pilot} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <img src="/icons/pilot_gold.png" alt="" className="icon-36" />
                  )}
                </div>
                <div className="shrinkable">
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff', lineHeight: 1.3 }}>
                    {build.parsed_pilot || 'Standard / Any'}
                  </div>
                </div>
              </div>
            </div>

            {/* Drone Card */}
            <div
              className="build-equipment-panel"
            >
              <span className="build-equipment-heading">
                <img src="/icons/drone_gold.png" alt="" className="icon-18" />
                Drone Options
              </span>
              {droneList.length > 0 ? (
                <div className="stack-10">
                  {droneList.map((dLine, idx) => {
                    const droneImg = getDroneImage(dLine);
                    return (
                      <div key={idx} className="row-center-14">
                        <div className="build-equipment-image">
                          {droneImg ? (
                            <img src={droneImg} alt={dLine} className="equipment-image-fit" />
                          ) : (
                            <img src="/icons/drone_gold.png" alt="" className="icon-36" />
                          )}
                        </div>
                        <span style={{ fontSize: '13.5px', color: '#fff', fontWeight: 700 }}>
                          {dLine}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>N/A</span>
              )}
            </div>

          </div>

          {/* Specializations & Modules Section */}
          <div
            className="build-detail-panel"
          >
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <img src="/icons/module_old_gold.png" alt="" className="icon-18" />
              Specialization & Recommended Modules
            </span>

            {/* Visual Module Badges (64px x 64px image size matching pilot) */}
            {parsedModules.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '14px' }}>
                {parsedModules.map((modName, idx) => {
                  const modImg = getModuleImage(modName);
                  return (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px',
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '10px',
                        padding: '10px 12px',
                      }}
                    >
                      <div
                        className="build-equipment-image"
                      >
                        {modImg ? (
                          <img src={modImg} alt={modName} className="equipment-image-fit" />
                        ) : (
                          <img src="/icons/module_old_gold.png" alt="" className="icon-36" />
                        )}
                      </div>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>
                        {modName}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
              {build.specialization}
            </div>
          </div>

          {/* Weapon Options (F2P and Meta Setups) */}
          <div className="build-equipment-grid">
            
            {/* F2P Setups */}
            <div
              className="build-detail-panel"
            >
              <div className="panel-heading-row">
                <img src="/icons/weapon_gold.png" alt="" className="icon-18" />
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#22c55e', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  F2P Setups
                </span>
              </div>

              {isF2pNotRec ? (
                <div style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  color: '#f87171',
                  fontSize: '12.5px',
                  fontWeight: 600
                }}>
                  {build.f2p_weapons}
                </div>
              ) : (
                <div className="equipment-tags">
                  {f2pWeaponList.map((w, idx) => {
                    const wImg = getWeaponImage(w);
                    return (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          background: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid var(--border-light)',
                          borderRadius: '8px',
                          padding: '6px 10px',
                        }}
                      >
                        {wImg ? (
                          <img src={wImg} alt={w} className="icon-26" />
                        ) : (
                          <img src="/icons/weapon_gold.png" alt="" className="icon-20" />
                        )}
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#fff' }}>
                          {w}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Meta Setups */}
            <div
              className="build-detail-panel"
            >
              <div className="panel-heading-row">
                <img src="/icons/weapon_gold.png" alt="" className="icon-18" />
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Meta Setups
                </span>
              </div>

              <div className="equipment-tags">
                {metaWeaponList.map((w, idx) => {
                  const wImg = getWeaponImage(w);
                  return (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: 'rgba(251, 191, 36, 0.05)',
                        border: '1px solid rgba(251, 191, 36, 0.25)',
                        borderRadius: '8px',
                        padding: '6px 10px',
                      }}
                    >
                      {wImg ? (
                        <img src={wImg} alt={w} className="icon-26" />
                      ) : (
                        <img src="/icons/weapon_gold.png" alt="" className="icon-20" />
                      )}
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#fbbf24' }}>
                        {w}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Description */}
          {build.explanation && (
            <div
              className="build-detail-panel"
            >
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>
                Build Strategy & Notes
              </span>
              <p style={{ fontSize: '13.5px', color: 'var(--text-primary)', lineHeight: 1.6, margin: 0 }}>
                {build.explanation}
              </p>
            </div>
          )}

        </div>
      </div>
    </div>,
    document.body
  );
}
