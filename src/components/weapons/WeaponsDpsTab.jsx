import { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Zap, RotateCw } from 'lucide-react';
import weaponsDpsData from '../../data/weapons_dps.json';
import { SearchInput } from '../common/SearchInput';
import { SlidingTabPills } from '../common/SlidingTabPills';
import { getWeaponImage } from '../../utils/imageUtils';

// Pre-compute object mapping and lowercased fields
const processedWeaponsData = {};
if (weaponsDpsData) {
  Object.entries(weaponsDpsData).forEach(([weaponClass, weapons]) => {
    processedWeaponsData[weaponClass] = weapons.map((weapon, index) => {
      const burstNum = parseFloat(weapon.burst_dps) || 0;
      const cycleNum = parseFloat(weapon.cycle_dps) || 0;
      return {
        ...weapon,
        id: `${weaponClass}:${index}`,
        burstNum,
        cycleNum,
        nameLower: weapon.name ? weapon.name.toLowerCase() : '',
        notesLower: weapon.notes ? weapon.notes.toLowerCase() : ''
      };
    });
  });
}

function WeaponModal({ weapon, weaponClass, maxStats, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!weapon) return null;

  const weaponImg = getWeaponImage(weapon.name, weaponClass);
  const burstPercent = maxStats.maxBurst > 0 ? Math.min(100, Math.max(5, (weapon.burstNum / maxStats.maxBurst) * 100)) : 0;
  const cyclePercent = maxStats.maxCycle > 0 ? Math.min(100, Math.max(5, (weapon.cycleNum / maxStats.maxCycle) * 100)) : 0;

  return createPortal(
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="weapon-modal-title">
      <div
        className="modal-content text-left"
        style={{
          maxWidth: '560px',
          position: 'relative',
          overflow: 'hidden',
          background: 'var(--bg-surface)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header" style={{ position: 'relative', zIndex: 1, paddingBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  background: 'rgba(6, 182, 212, 0.1)',
                  color: 'var(--cyan)',
                  border: '1px solid rgba(6, 182, 212, 0.25)',
                }}
              >
                {weaponClass.replace(' Weapons', '')} Class
              </span>
              {weapon.range && (
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: 'rgba(255, 255, 255, 0.06)',
                    color: 'var(--text-muted)',
                  }}
                >
                  Range: {weapon.range}
                </span>
              )}
            </div>
            <h3 id="weapon-modal-title" style={{ fontSize: '22px', fontWeight: 800, color: '#fff', margin: 0 }}>
              {weapon.name}
            </h3>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Centered Large Weapon Image */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
              borderRadius: '12px',
              background: 'rgba(10, 14, 23, 0.6)',
              border: '1px solid var(--border-light)',
            }}
          >
            {weaponImg ? (
              <img
                src={weaponImg}
                alt={weapon.name}
                style={{
                  maxHeight: '140px',
                  maxWidth: '100%',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.5))',
                }}
              />
            ) : (
              <img src="/icons/weapon_gold.png" alt="" style={{ width: '64px', height: '64px', objectFit: 'contain' }} />
            )}
          </div>

          {/* DPS Bars Scaled against highest in Weight Class */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              padding: '16px',
              borderRadius: '12px',
              background: 'rgba(10, 14, 23, 0.65)',
              border: '1px solid var(--border-light)',
            }}
          >
            {/* Burst DPS */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--cyan)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Zap size={14} /> Burst DPS
                </span>
                <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--cyan)' }}>
                  {weapon.burstNum > 0 ? Math.round(weapon.burstNum).toLocaleString() : weapon.burst_dps}
                </span>
              </div>
              <div style={{ height: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${burstPercent}%`,
                    background: 'linear-gradient(90deg, #0891b2, var(--cyan))',
                    borderRadius: '4px',
                    transition: 'width 0.4s ease',
                  }}
                />
              </div>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginTop: '3px' }}>
                {Math.round(burstPercent)}% of class max ({Math.round(maxStats.maxBurst).toLocaleString()})
              </span>
            </div>

            {/* Cycle DPS */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--purple)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <RotateCw size={14} /> Cycle DPS
                </span>
                <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--purple)' }}>
                  {weapon.cycleNum > 0 ? Math.round(weapon.cycleNum).toLocaleString() : weapon.cycle_dps}
                </span>
              </div>
              <div style={{ height: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${cyclePercent}%`,
                    background: 'linear-gradient(90deg, #7c3aed, var(--purple))',
                    borderRadius: '4px',
                    transition: 'width 0.4s ease',
                  }}
                />
              </div>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginTop: '3px' }}>
                {Math.round(cyclePercent)}% of class max ({Math.round(maxStats.maxCycle).toLocaleString()})
              </span>
            </div>
          </div>

          {/* Notes / Special Features */}
          {weapon.notes && (
            <div
              style={{
                padding: '16px',
                borderRadius: '12px',
                background: 'rgba(10, 14, 23, 0.65)',
                border: '1px solid var(--border-light)',
              }}
            >
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
                Notes & Special Features
              </span>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0, whiteSpace: 'pre-line' }}>
                {weapon.notes}
              </p>
            </div>
          )}

        </div>
      </div>
    </div>,
    document.body
  );
}

export function WeaponsDpsTab() {
  const [selectedWeaponClass, setSelectedWeaponClass] = useState('Heavy Weapons');
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('burst_dps');
  const [selectedWeapon, setSelectedWeapon] = useState(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchQuery(searchInput);
    }, 250);
    return () => {
      clearTimeout(handler);
    };
  }, [searchInput]);

  // Max DPS values for the current weight class to scale relative visual bars
  const maxStats = useMemo(() => {
    let maxBurst = 1;
    let maxCycle = 1;
    const list = processedWeaponsData[selectedWeaponClass] || [];
    list.forEach(w => {
      if (w.burstNum > maxBurst) maxBurst = w.burstNum;
      if (w.cycleNum > maxCycle) maxCycle = w.cycleNum;
    });
    return { maxBurst, maxCycle };
  }, [selectedWeaponClass]);

  // Filter and sort weapons
  const filteredWeapons = useMemo(() => {
    if (!processedWeaponsData[selectedWeaponClass]) return [];
    const query = searchQuery.toLowerCase();
    
    let list = processedWeaponsData[selectedWeaponClass].filter(weapon =>
      weapon.nameLower.includes(query) ||
      weapon.notesLower.includes(query)
    );

    list = [...list].sort((a, b) => {
      if (sortBy === 'cycle_dps') {
        return b.cycleNum - a.cycleNum;
      }
      return b.burstNum - a.burstNum;
    });

    return list;
  }, [selectedWeaponClass, searchQuery, sortBy]);

  return (
    <div className="animate-fade-in text-left">
      <div className="hero-banner" style={{ padding: '24px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '28px', marginBottom: '8px' }}>Weapon DPS Visualizer</h2>
        <p style={{ margin: '0 auto' }}>
          Explore damage output and engagement stats for weapons across all weight classes. Click any weapon card to view DPS analytics and notes.
        </p>
      </div>

      <div className="weapons-tab-container">
        {/* Weapon Class Pills */}
        <SlidingTabPills
          tabs={[
            { label: 'Heavy', value: 'Heavy Weapons' },
            { label: 'Medium', value: 'Medium Weapons' },
            { label: 'Light', value: 'Light Weapons' },
            { label: 'Alpha', value: 'Alpha Weapons' },
            { label: 'Beta', value: 'Beta Weapons' }
          ]}
          activeTab={selectedWeaponClass}
          onChange={(val) => { setSelectedWeaponClass(val); setSearchInput(''); setSearchQuery(''); }}
        />

        {/* Filter controls row */}
        <div className="search-container" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '240px' }}>
            <SearchInput
              placeholder={`Search ${selectedWeaponClass.toLowerCase()}...`}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>

          <select
            className="select-filter"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ width: 'auto', minWidth: '180px' }}
          >
            <option value="burst_dps">Sort by Burst DPS (Default)</option>
            <option value="cycle_dps">Sort by Cycle DPS</option>
          </select>
        </div>

        {/* Weapon Image Cards Grid */}
        <div
          className="dashboard-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '14px',
            marginTop: '20px',
          }}
        >
          {filteredWeapons.map(weapon => {
            const weaponImg = getWeaponImage(weapon.name, selectedWeaponClass);

            return (
              <div
                className="glass-panel glass-panel-hover weapon-card"
                key={weapon.id}
                onClick={() => setSelectedWeapon(weapon)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedWeapon(weapon);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={`View DPS details for ${weapon.name}`}
                style={{
                  position: 'relative',
                  height: '220px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '14px',
                  border: '1px solid var(--border-light)',
                  background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.6) 0%, rgba(10, 14, 23, 0.95) 100%)',
                }}
              >
                {/* Background Artwork */}
                {weaponImg ? (
                  <img
                    src={weaponImg}
                    alt={weapon.name}
                    loading="lazy"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      objectPosition: 'center 30%',
                      zIndex: 0,
                      transition: 'transform 0.3s ease',
                      padding: '14px',
                      boxSizing: 'border-box'
                    }}
                    className="weapon-card-bg-img"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : null}

                {/* Scrim Overlay */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(180deg, rgba(10, 14, 23, 0.8) 0%, rgba(10, 14, 23, 0.25) 50%, rgba(10, 14, 23, 0.92) 100%)',
                    zIndex: 1,
                    pointerEvents: 'none',
                  }}
                />

                {/* Top Overlay: Name & Range */}
                <div
                  style={{
                    position: 'relative',
                    zIndex: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '8px',
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <h4
                      style={{
                        margin: '0 0 4px 0',
                        fontSize: '16px',
                        fontWeight: 700,
                        color: '#fff',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        textShadow: '0 2px 4px rgba(0,0,0,0.8)',
                      }}
                      title={weapon.name}
                    >
                      {weapon.name}
                    </h4>
                    {weapon.range && (
                      <span
                        style={{
                          fontSize: '10.5px',
                          fontWeight: 600,
                          color: 'var(--text-muted)',
                          background: 'rgba(255, 255, 255, 0.08)',
                          padding: '1px 6px',
                          borderRadius: '4px',
                        }}
                      >
                        {weapon.range}
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom Overlay: Burst & Cycle DPS */}
                <div
                  style={{
                    position: 'relative',
                    zIndex: 2,
                    background: 'rgba(10, 14, 23, 0.7)',
                    backdropFilter: 'blur(6px)',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '9.5px', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>BURST</span>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--cyan)' }}>
                      {weapon.burstNum > 0 ? Math.round(weapon.burstNum).toLocaleString() : weapon.burst_dps}
                    </span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '9.5px', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>CYCLE</span>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--purple)' }}>
                      {weapon.cycleNum > 0 ? Math.round(weapon.cycleNum).toLocaleString() : weapon.cycle_dps}
                    </span>
                  </div>
                </div>

                {/* Screen-reader description for testing and search accessibility */}
                <div className="sr-only">
                  {weapon.notes}
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal for selected weapon */}
        {selectedWeapon && (
          <WeaponModal
            weapon={selectedWeapon}
            weaponClass={selectedWeaponClass}
            maxStats={maxStats}
            onClose={() => setSelectedWeapon(null)}
          />
        )}
      </div>
    </div>
  );
}
