import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import tiersData from '../../data/tiers.json';

export function TierListTab({ onItemClick }) {
  const [selectedCategory, setSelectedCategory] = useState('Robots');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTiers = useMemo(() => {
    if (!tiersData || !tiersData[selectedCategory]) return {};
    
    const categoryData = tiersData[selectedCategory];
    const result = {};
    const query = searchQuery.toLowerCase();
    
    Object.keys(categoryData).forEach(tierLetter => {
      const tierObj = categoryData[tierLetter];
      const filteredItems = tierObj.items.filter(item => 
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
      );
      
      if (filteredItems.length > 0 || searchQuery === '') {
        result[tierLetter] = {
          casual_name: tierObj.casual_name,
          items: filteredItems
        };
      }
    });
    
    return result;
  }, [selectedCategory, searchQuery]);

  return (
    <div className="animate-fade-in text-left">
      <div className="hero-banner" style={{ padding: '24px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '28px', marginBottom: '8px' }}>Tier Lists</h2>
        <p style={{ margin: '0 auto' }}>
          A power based tier list that ranks every unit in the game.
        </p>
      </div>

      {/* Category Select Tab Pills */}
      <div className="tab-pills">
        {['Robots', 'Titans', 'Drones', 'Motherships', 'Mothership Turrets', 'Robot Weapons', 'Titan Weapons'].map(cat => (
          <button 
            key={cat} 
            className={`tab-pill ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => { setSelectedCategory(cat); setSearchQuery(''); }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Search filter inside Tiers */}
      <div className="search-container">
        <div className="search-input-wrapper">
          <Search size={18} className="search-input-icon" />
          <input 
            type="text" 
            className="search-input" 
            placeholder={`Search ${selectedCategory.toLowerCase()} in tier lists...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Tier list visual lines */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {['X', 'S', 'A', 'B', 'C', 'D', 'E', 'F', 'Z'].map(tierLetter => {
          const tierInfo = filteredTiers[tierLetter];
          if (!tierInfo || tierInfo.items.length === 0) return null;
          
          // Get corresponding styles
          const tierColor = `var(--tier-${tierLetter.toLowerCase()})`;
          const tierBg = `var(--tier-${tierLetter.toLowerCase()}-bg)`;
          const tierBorder = `var(--tier-${tierLetter.toLowerCase()}-border)`;
          
          return (
            <div className="tier-row" key={tierLetter}>
              <div 
                className="tier-badge-container" 
                style={{ 
                  backgroundColor: tierBg, 
                  color: tierColor,
                  borderColor: tierBorder 
                }}
              >
                {tierLetter}
                <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', marginTop: '4px', textTransform: 'uppercase' }}>
                  Tier
                </span>
              </div>
              
              <div className="tier-content">
                {tierInfo.items.map(item => (
                  <div 
                    className="tier-item-card" 
                    key={item.name}
                    onClick={() => onItemClick(item.name, selectedCategory, item)}
                  >
                    <div className="tier-item-name">{item.name}</div>
                    <div className="tier-item-excerpt">{item.description}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footnotes */}
      <div style={{ marginTop: '24px', padding: '16px 0 0 0', borderTop: '1px solid var(--border-light)', fontSize: '12px', color: 'var(--text-muted)' }}>
        <p style={{ margin: 0 }}>* Only in squad / coordinated play</p>
      </div>
    </div>
  );
}
