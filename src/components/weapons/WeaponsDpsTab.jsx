import { useState, useMemo, useEffect } from 'react';
import { X } from 'lucide-react';
import weaponsDpsData from '../../data/weapons_dps.json';
import { SearchInput } from '../common/SearchInput';

// Pre-compute object mapping and lowercased fields to avoid
// redundant allocations and string operations on every render/filter
const processedWeaponsData = {};
if (weaponsDpsData) {
  Object.entries(weaponsDpsData).forEach(([weaponClass, weapons]) => {
    processedWeaponsData[weaponClass] = weapons.map((weapon, index) => ({
      ...weapon,
      compareId: `${weaponClass}:${index}`,
      nameLower: weapon.name ? weapon.name.toLowerCase() : '',
      notesLower: weapon.notes ? weapon.notes.toLowerCase() : ''
    }));
  });
}

export function WeaponsDpsTab() {
  const [selectedWeaponClass, setSelectedWeaponClass] = useState('Heavy Weapons');
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [compareList, setCompareList] = useState([]); // Array of weapon objects

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchQuery(searchInput);
    }, 250);
    return () => {
      clearTimeout(handler);
    };
  }, [searchInput]);

  // Filtered weapons for table
  const filteredWeapons = useMemo(() => {
    if (!processedWeaponsData[selectedWeaponClass]) return [];
    const query = searchQuery.toLowerCase();
    
    return processedWeaponsData[selectedWeaponClass].filter(weapon =>
      weapon.nameLower.includes(query) ||
      weapon.notesLower.includes(query)
    );
  }, [selectedWeaponClass, searchQuery]);

  // Max DPS values for scaling chart bars
  const maxDpsValues = useMemo(() => {
    if (compareList.length === 0) return { burst: 1, cycle: 1 };
    
    let maxBurst = 1;
    let maxCycle = 1;
    
    compareList.forEach(w => {
      const bDps = Math.round(parseFloat(w.burst_dps)) || 0;
      const cDps = Math.round(parseFloat(w.cycle_dps)) || 0;
      if (bDps > maxBurst) maxBurst = bDps;
      if (cDps > maxCycle) maxCycle = cDps;
    });
    
    return { burst: maxBurst, cycle: maxCycle };
  }, [compareList]);

  const toggleWeaponCompare = (weapon, className) => {
    const isSelected = compareList.some(w => w.compareId === weapon.compareId);
    
    if (isSelected) {
      setCompareList(compareList.filter(w => w.compareId !== weapon.compareId));
    } else {
      if (compareList.length >= 4) {
        alert("You can compare up to 4 weapons at a time.");
        return;
      }
      setCompareList([...compareList, { ...weapon, weaponClass: className }]);
    }
  };

  const isWeaponCompareSelected = (compareId) => {
    return compareList.some(w => w.compareId === compareId);
  };

  return (
    <div className="animate-fade-in text-left">
      <div className="hero-banner" style={{ padding: '24px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '28px', marginBottom: '8px' }}>Weapon DPS Calculator & Comparison</h2>
        <p style={{ margin: '0 auto' }}>
          Compare the DPS of most weapons in the game. Select up to four weapons to generate a bar chart.
          <span style={{ display: 'block', marginTop: '8px', fontSize: '13px', color: 'var(--text-secondary)', opacity: 0.85 }}>
            <em>Several older weapons are not included.</em>
          </span>
        </p>
      </div>

      <div className="weapons-tab-container">
        {/* Compare Panel Bar */}
        {compareList.length > 0 && (
          <div className="weapon-comparison-bar animate-fade-in">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '11px', color: 'var(--cyan)', fontWeight: 600 }}>WEAPON COMPARISON ({compareList.length}/4)</span>
              <div className="selected-weapons-list">
                {compareList.map(w => (
                  <div className="selected-weapon-tag" key={w.compareId}>
                    <span>{w.name}</span>
                    <button className="remove-weapon-btn" onClick={() => toggleWeaponCompare(w, w.weaponClass)}>
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            <button className="compare-action-btn" onClick={() => {
              document.getElementById('comparison-charts')?.scrollIntoView({ behavior: 'smooth' });
            }}>
              View Visual Chart Comparison
            </button>
          </div>
        )}

        {/* Weapon Class Pills */}
        <div className="tab-pills">
          {['Heavy Weapons', 'Medium Weapons', 'Light Weapons', 'Alpha Weapons', 'Beta Weapons'].map(wclass => (
            <button 
              key={wclass} 
              className={`tab-pill ${selectedWeaponClass === wclass ? 'active' : ''}`}
              onClick={() => { setSelectedWeaponClass(wclass); setSearchInput(''); setSearchQuery(''); }}
            >
              {wclass.replace(' Weapons', '')}
            </button>
          ))}
        </div>

        {/* Search weapons */}
        <div className="search-container">
          <SearchInput
            placeholder={`Search ${selectedWeaponClass.toLowerCase()}...`}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>

        {/* Weapons Data Table */}
        <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container">
            <table className="weapons-table">
              <thead>
                <tr>
                  <th style={{ width: '40px', textAlign: 'center' }}>CMP</th>
                  <th>Weapon</th>
                  <th style={{ textAlign: 'right' }}>Burst DPS</th>
                  <th style={{ textAlign: 'right' }}>Cycle DPS</th>
                  <th>Range</th>
                  <th>Notes / Special Features</th>
                </tr>
              </thead>
              <tbody>
                {filteredWeapons.map(weapon => {
                  const isSelected = isWeaponCompareSelected(weapon.compareId);
                  return (
                    <tr key={weapon.compareId} className={isSelected ? 'compare-selected' : ''}>
                      <td style={{ textAlign: 'center' }}>
                        <input 
                          type="checkbox" 
                          checked={isSelected}
                          onChange={() => toggleWeaponCompare(weapon, selectedWeaponClass)}
                          style={{ cursor: 'pointer', accentColor: 'var(--cyan)' }}
                        />
                      </td>
                      <td style={{ fontWeight: 600, color: '#fff' }}>{weapon.name}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--cyan)' }}>
                        {parseFloat(weapon.burst_dps) ? Math.round(parseFloat(weapon.burst_dps)).toLocaleString() : weapon.burst_dps}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--purple)' }}>
                        {parseFloat(weapon.cycle_dps) ? Math.round(parseFloat(weapon.cycle_dps)).toLocaleString() : weapon.cycle_dps}
                      </td>
                      <td>{weapon.range}</td>
                      <td style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>{weapon.notes}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Visual Comparisons Chart Section */}
        {compareList.length > 0 && (
          <div id="comparison-charts" className="glass-panel comparison-chart-container animate-fade-in" style={{ marginTop: '24px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img src="/icons/weapon_gold.png" alt="" style={{ width: '26px', height: '26px', objectFit: 'contain' }} /> Weapon DPS visualizer
            </h3>
            
            <div className="chart-legend">
              <div className="legend-item">
                <div className="legend-color-box" style={{ background: 'linear-gradient(90deg, #397496, var(--cyan))' }}></div>
                <span>Burst DPS</span>
              </div>
              <div className="legend-item">
                <div className="legend-color-box" style={{ background: 'linear-gradient(90deg, #1e40af, #3b82f6)' }}></div>
                <span>Cycle DPS</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '12px' }}>
              {compareList.map(weapon => {
                const bDps = Math.round(parseFloat(weapon.burst_dps)) || 0;
                const cDps = Math.round(parseFloat(weapon.cycle_dps)) || 0;
                
                const burstPercent = Math.max(5, (bDps / maxDpsValues.burst) * 100);
                const cyclePercent = Math.max(5, (cDps / maxDpsValues.cycle) * 100);
                
                return (
                  <div className="chart-bar-row" key={weapon.compareId}>
                    <div className="chart-bar-info">
                      <span style={{ fontWeight: 700 }}>{weapon.name}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Class: {weapon.weaponClass.replace(' Weapons', '')} | Range: {weapon.range}</span>
                    </div>
                    
                    <div className="chart-bar-tracks">
                      {/* Burst DPS Track */}
                      <div className="chart-track">
                        <div className="chart-track-fill" style={{ width: `${burstPercent}%` }}>
                          <span className="chart-value-label">
                            Burst: {bDps > 0 ? bDps.toLocaleString() : (parseFloat(weapon.burst_dps) ? Math.round(parseFloat(weapon.burst_dps)).toLocaleString() : weapon.burst_dps)}
                          </span>
                        </div>
                      </div>
                      
                      {/* Cycle DPS Track */}
                      <div className="chart-track">
                        <div className="chart-track-fill cycle" style={{ width: `${cyclePercent}%` }}>
                          <span className="chart-value-label">
                            Cycle: {cDps > 0 ? cDps.toLocaleString() : (parseFloat(weapon.cycle_dps) ? Math.round(parseFloat(weapon.cycle_dps)).toLocaleString() : weapon.cycle_dps)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
