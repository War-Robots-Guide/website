import { useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { getTierForName } from '../../utils/tierLookup';
import { parseEquipmentOptions, parseBuildSpecialization } from '../../utils/buildEquipment';
import { ModuleList } from '../common/ModuleList';
import {
  getRobotImage,
  getPilotImage,
  getDroneImage,
  getWeaponImage,
} from '../../utils/imageUtils';

function parseWeaponFamilies(text) {
  if (!text || text === 'N/A') return [];
  return text.replace(/\+\s*\r?\n\s*/g, '+').replace(/\r?\n\s*\+/g, '+')
    .split(/\r?\n/).map(line => line.trim())
    .filter(line => line && !/^not recommended/i.test(line))
    .map(line => line.split(/[+,/]/).map(name => name.trim()).filter(Boolean));
}

function WeaponFamilies({ families, label }) {
  return <div className="weapon-family-list" role="list" aria-label={label}>
    {families.map((family, index) => <div className="weapon-family-row" role="listitem" key={index}>
      {family.map((weapon, memberIndex) => <span className="weapon-family-member" key={`${weapon}-${memberIndex}`}>
        {memberIndex > 0 && <span aria-hidden="true">+</span>}
        <img src={getWeaponImage(weapon) || '/icons/weapon_gold.png'} alt="" className="icon-26" />
        <span>{weapon}</span>
      </span>)}
    </div>)}
  </div>;
}

function EquipmentOptions({ options, kind }) {
  const getImage = kind === 'pilot' ? getPilotImage : getDroneImage;
  return <div className="stack-10" role="list" aria-label={kind === 'pilot' ? 'Pilot options' : 'Drone options'}>
    {options.map(({ name, note }, index) => {
      const image = getImage(name);
      return <div className="build-option" role="listitem" key={index}>
        {name && <div className="build-equipment-image">
          <img src={image || `/icons/${kind}_gold.png`} alt={name} className="equipment-image-fit" />
        </div>}
        <div className="shrinkable"><strong>{name}</strong>{note && <p className="equipment-note">{note}</p>}</div>
      </div>;
    })}
  </div>;
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
    return getTierForName(build.robot, build.is_titan ? 'Titans' : 'Robots');
  }, [build]);

  const pilotOptions = useMemo(() => parseEquipmentOptions(build?.pilot || build?.parsed_pilot || '', 'pilot'), [build]);
  const droneOptions = useMemo(() => parseEquipmentOptions(build?.drone_options || '', 'drone'), [build]);
  const specialization = useMemo(() => parseBuildSpecialization(build?.specialization || '', build?.is_titan), [build]);

  const f2pWeaponList = useMemo(() => {
    if (!build?.f2p_weapons) return [];
    return parseWeaponFamilies(build.f2p_weapons);
  }, [build]);

  const metaWeaponList = useMemo(() => {
    if (!build?.best_weapons) return [];
    return parseWeaponFamilies(build.best_weapons);
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
              {pilotOptions.length ? <EquipmentOptions options={pilotOptions} kind="pilot" /> : <span>Standard / Any</span>}
            </div>

            {/* Drone Card */}
            {!build.is_titan && <div
              className="build-equipment-panel"
            >
              <span className="build-equipment-heading">
                <img src="/icons/drone_gold.png" alt="" className="icon-18" />
                Drone Options
              </span>
              {droneOptions.length ? <EquipmentOptions options={droneOptions} kind="drone" /> : <span>N/A</span>}
            </div>}

          </div>

          <div className="build-equipment-grid">
            <section className="build-detail-panel" aria-label="Passive Specialization">
              <h3 className="build-equipment-heading">Passive Specialization</h3>
              {specialization.passive.map((option, index) => <div className="passive-option" key={index}>
                <h4>{option.name}</h4>
                <ModuleList modules={option.modules} />
              </div>)}
            </section>
            <section className="build-detail-panel" aria-label="Active Module">
              <h3 className="build-equipment-heading">Active Module</h3>
              {specialization.active.length ? <ModuleList modules={specialization.active} /> : <p className="equipment-note">{build.is_titan ? 'Not applicable to Titans.' : 'No active module specified.'}</p>}
            </section>
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
                <WeaponFamilies families={f2pWeaponList} label="F2P weapon families" />
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

              <WeaponFamilies families={metaWeaponList} label="Meta weapon families" />
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
