import { Search, X } from 'lucide-react';
import robotGuideData from '../../data/robot_guide.json';
import { RatingBar } from '../common/RatingBar';

export function HangarSelectorModal({ activeSlot, selectorSearchQuery, setSelectorSearchQuery, onClose, onSelect }) {
  const isTitanSlot = activeSlot === 5;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content text-left" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 style={{ fontSize: '22px' }}>
              {isTitanSlot ? 'Select Titan' : `Select Robot for Slot ${activeSlot + 1}`}
            </h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="search-input-wrapper">
            <Search size={18} className="search-input-icon" />
            <input 
              type="text" 
              className="search-input" 
              placeholder={isTitanSlot ? "Search Titans..." : "Search Robots..."}
              value={selectorSearchQuery}
              onChange={(e) => setSelectorSearchQuery(e.target.value)}
              autoFocus
            />
          </div>

          <div style={{ maxHeight: '350px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '4px' }}>
            {isTitanSlot ? (
              // Titan selections
              robotGuideData?.titans?.filter(t => t.name.toLowerCase().includes(selectorSearchQuery.toLowerCase())).map(titan => (
                <div 
                  key={titan.name} 
                  className="glass-panel glass-panel-hover" 
                  style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', border: '1px solid var(--border-light)' }}
                  onClick={() => onSelect(titan)}
                >
                  <div>
                    <span style={{ fontWeight: 700, color: '#fff' }}>{titan.name}</span>
                    <span style={{ fontSize: '11px', color: 'var(--purple)', marginLeft: '10px' }}>Titan</span>
                  </div>
                  <div style={{ display: 'flex', minWidth: '160px', justifyContent: 'flex-end' }}>
                    <RatingBar rating={titan.value_rating} unitType="titan" align="right" />
                  </div>
                </div>
              ))
            ) : (
              // Robot selections
              robotGuideData?.robots?.filter(r => r.name.toLowerCase().includes(selectorSearchQuery.toLowerCase())).map(robot => (
                <div 
                  key={robot.name} 
                  className="glass-panel glass-panel-hover" 
                  style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '8px', cursor: 'pointer', border: '1px solid var(--border-light)' }}
                  onClick={() => onSelect(robot)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, color: '#fff' }}>{robot.name}</span>
                    <div style={{ display: 'flex', minWidth: '160px', justifyContent: 'flex-end' }}>
                      <RatingBar rating={robot.value_rating} unitType="robot" align="right" />
                    </div>
                  </div>
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
            
            {((isTitanSlot && !robotGuideData?.titans?.some(t => t.name.toLowerCase().includes(selectorSearchQuery.toLowerCase()))) ||
              (!isTitanSlot && !robotGuideData?.robots?.some(r => r.name.toLowerCase().includes(selectorSearchQuery.toLowerCase())))) && (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                No results found matching "{selectorSearchQuery}"
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
