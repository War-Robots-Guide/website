import { useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import robotGuideData from '../../data/robot_guide.json';
import { RatingBar } from '../common/RatingBar';
import { SearchInput } from '../common/SearchInput';
import { getTierForName } from '../../utils/tierLookup';

const precomputedTitans = (robotGuideData?.titans || []).map(t => ({
  ...t,
  _searchName: t.name.toLowerCase(),
}));

const precomputedRobots = (robotGuideData?.robots || []).map(r => ({
  ...r,
  _searchName: r.name.toLowerCase(),
}));

export function HangarSelectorModal({ activeSlot, selectorSearchQuery, setSelectorSearchQuery, onClose, onSelect }) {
  const isTitanSlot = activeSlot === 5;
  const lowerCaseQuery = (selectorSearchQuery || "").toLowerCase();

  const filteredItems = useMemo(() => {
    const category = isTitanSlot ? 'Titans' : 'Robots';
    const items = isTitanSlot ? precomputedTitans : precomputedRobots;
    const filtered = items.filter(item => item._searchName.includes(lowerCaseQuery));

    const TIER_ORDER = { 'x': 0, 's': 1, 'a': 2, 'b': 3, 'c': 4, 'd': 5 };
    const getTierRank = (item) => {
      const tier = getTierForName(item.name, category);
      if (!tier) return 99;
      const key = tier.toLowerCase();
      return TIER_ORDER[key] !== undefined ? TIER_ORDER[key] : 98;
    };

    return [...filtered].sort((a, b) => {
      const rankA = getTierRank(a);
      const rankB = getTierRank(b);
      if (rankA !== rankB) {
        return rankA - rankB;
      }
      return a.name.localeCompare(b.name);
    });
  }, [isTitanSlot, lowerCaseQuery]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return createPortal(
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content text-left" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 style={{ fontSize: '22px' }}>
              {isTitanSlot ? 'Select Titan' : `Select Robot for Slot ${activeSlot + 1}`}
            </h3>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close selector">
            <X size={20} />
          </button>
        </div>
        
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <SearchInput
            placeholder={isTitanSlot ? "Search Titans..." : "Search Robots..."}
            value={selectorSearchQuery}
            onChange={(e) => setSelectorSearchQuery(e.target.value)}
            autoFocus
            aria-label={isTitanSlot ? "Search Titans" : "Search Robots"}
          />

          <div style={{ maxHeight: '350px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '4px' }} role="listbox">
            {isTitanSlot ? (
              // Titan selections
              filteredItems.map(titan => (
                <div 
                  key={titan.name} 
                  className="glass-panel glass-panel-hover" 
                  style={{ flexShrink: 0, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', border: '1px solid var(--border-light)' }}
                  onClick={() => onSelect(titan)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(titan); } }}
                  tabIndex={0}
                  role="option"
                  aria-selected="false"
                >
                  {(() => {
                    const tier = getTierForName(titan.name, 'Titans') || 'Z';
                    const tierLower = tier.toLowerCase();
                    return (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 700, color: '#fff' }}>{titan.name}</span>
                        <span style={{ fontSize: '11px', color: 'var(--purple)', fontWeight: 600, textTransform: 'uppercase' }}>Titan</span>
                        <span 
                          className={`tier-badge-${tierLower}`} 
                          style={{ 
                            fontSize: '10px', 
                            fontWeight: 700, 
                            background: `var(--tier-${tierLower}-bg)`, 
                            color: `var(--tier-${tierLower})`, 
                            border: `1px solid var(--tier-${tierLower}-border)`, 
                            padding: '2px 6px', 
                            borderRadius: '4px' 
                          }}
                        >
                          {tier} Tier
                        </span>
                      </div>
                    );
                  })()}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                    <span style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Value Rating
                    </span>
                    <RatingBar rating={titan.value_rating} unitType="titan" align="right" />
                  </div>
                </div>
              ))
            ) : (
              // Robot selections
              filteredItems.map(robot => (
                <div 
                  key={robot.name} 
                  className="glass-panel glass-panel-hover" 
                  style={{ flexShrink: 0, padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '8px', cursor: 'pointer', border: '1px solid var(--border-light)' }}
                  onClick={() => onSelect(robot)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(robot); } }}
                  tabIndex={0}
                  role="option"
                  aria-selected="false"
                >
                  {(() => {
                    const tier = getTierForName(robot.name, 'Robots') || 'Z';
                    const tierLower = tier.toLowerCase();
                    return (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 700, color: '#fff' }}>{robot.name}</span>
                          <span 
                            className={`tier-badge-${tierLower}`} 
                            style={{ 
                              fontSize: '10px', 
                              fontWeight: 700, 
                              background: `var(--tier-${tierLower}-bg)`, 
                              color: `var(--tier-${tierLower})`, 
                              border: `1px solid var(--tier-${tierLower}-border)`, 
                              padding: '2px 6px', 
                              borderRadius: '4px' 
                            }}
                          >
                            {tier} Tier
                          </span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                          <span style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Value Rating
                          </span>
                          <RatingBar rating={robot.value_rating} unitType="robot" align="right" />
                        </div>
                      </div>
                    );
                  })()}
                  {robot.roles && robot.roles.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {robot.roles.map(role => (
                        <span 
                          key={role.role} 
                          className={`role-badge ${role.type}`} 
                          style={{ fontSize: '10px', padding: '1px 6px' }}
                        >
                          {role.role}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
            
            {filteredItems.length === 0 && (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                No results found matching "{selectorSearchQuery}"
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
