import { useState, useMemo } from 'react';
import tiersData from '../../data/tiers.json';
import robotGuideData from '../../data/robot_guide.json';
import { SearchInput } from '../common/SearchInput';
import { SlidingTabPills } from '../common/SlidingTabPills';
import { getItemImage, extractTierTags, isNewTierItem, getSpecializationIcon, cleanKey } from '../../utils/imageUtils';

// Pre-compute lowercased names and descriptions once outside the component
const optimizedTiersData = tiersData ? JSON.parse(JSON.stringify(tiersData)) : {};
if (optimizedTiersData) {
  Object.keys(optimizedTiersData).forEach(cat => {
    if (cat === 'disclaimers') return;
    Object.keys(optimizedTiersData[cat]).forEach(tierLetter => {
      optimizedTiersData[cat][tierLetter].items.forEach(item => {
        item._searchName = item.name.toLowerCase();
        item._searchDesc = item.description.toLowerCase();
      });
    });
  });
}

const TIER_BG_GRADIENTS = {
  x: 'linear-gradient(135deg, rgba(245, 158, 11, 0.4) 0%, rgba(120, 53, 15, 0.75) 100%)',
  s: 'linear-gradient(135deg, rgba(234, 179, 8, 0.35) 0%, rgba(113, 63, 18, 0.7) 100%)',
  a: 'linear-gradient(135deg, rgba(168, 85, 247, 0.35) 0%, rgba(88, 28, 135, 0.7) 100%)',
  b: 'linear-gradient(135deg, rgba(59, 130, 246, 0.35) 0%, rgba(30, 58, 138, 0.7) 100%)',
  c: 'linear-gradient(135deg, rgba(16, 185, 129, 0.3) 0%, rgba(6, 78, 59, 0.65) 100%)',
  d: 'linear-gradient(135deg, rgba(100, 116, 139, 0.3) 0%, rgba(30, 41, 59, 0.7) 100%)',
  e: 'linear-gradient(135deg, rgba(71, 85, 105, 0.3) 0%, rgba(15, 23, 42, 0.7) 100%)',
  f: 'linear-gradient(135deg, rgba(51, 65, 85, 0.3) 0%, rgba(15, 23, 42, 0.7) 100%)',
  z: 'linear-gradient(135deg, rgba(30, 41, 59, 0.3) 0%, rgba(10, 14, 23, 0.7) 100%)',
};

export function TierListTab({ onItemClick }) {
  const [selectedCategory, setSelectedCategory] = useState('Robots');
  const [searchQuery, setSearchQuery] = useState('');

  const robotRolesMap = useMemo(() => {
    const map = {};
    if (robotGuideData?.robots) {
      robotGuideData.robots.forEach(r => {
        const primaryRole = r.roles?.find(role => role.type === 'primary')?.role;
        if (primaryRole) map[cleanKey(r.name)] = primaryRole;
      });
    }
    if (robotGuideData?.titans) {
      robotGuideData.titans.forEach(t => {
        const primaryRole = t.roles?.find(role => role.type === 'primary')?.role;
        if (primaryRole) map[cleanKey(t.name)] = primaryRole;
      });
    }
    return map;
  }, []);

  const filteredTiers = useMemo(() => {
    if (!optimizedTiersData || !optimizedTiersData[selectedCategory]) return {};
    
    const categoryData = optimizedTiersData[selectedCategory];
    const result = {};
    const query = searchQuery.toLowerCase();
    
    Object.keys(categoryData).forEach(tierLetter => {
      const tierObj = categoryData[tierLetter];
      const filteredItems = tierObj.items.filter(item => 
        item._searchName.includes(query) ||
        item._searchDesc.includes(query)
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
          A power based tier list ranking every unit and item in the game. Click any card to inspect full ratings and rationales.
        </p>
      </div>

      {/* Category Select Tab Pills */}
      <SlidingTabPills
        tabs={[
          { label: 'Robots', value: 'Robots' },
          { label: 'Titans', value: 'Titans' },
          { label: 'Drones', value: 'Drones' },
          { label: 'Motherships', value: 'Motherships' },
          { label: 'Mothership Turrets', value: 'Mothership Turrets' },
          { label: 'Robot Weapons', value: 'Robot Weapons' },
          { label: 'Titan Weapons', value: 'Titan Weapons' }
        ]}
        activeTab={selectedCategory}
        onChange={(val) => { setSelectedCategory(val); setSearchQuery(''); }}
      />

      {/* Search filter inside Tiers */}
      <div className="search-container">
        <SearchInput
          placeholder={`Search ${selectedCategory.toLowerCase()} in tier lists...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Prydwen Style Tier List Rows */}
      <div className="prydwen-tierlist-container" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {['X', 'S', 'A', 'B', 'C', 'D', 'E', 'F', 'Z'].map(tierLetter => {
          const tierInfo = filteredTiers[tierLetter];
          if (!tierInfo || tierInfo.items.length === 0) return null;
          
          const tierKey = tierLetter.toLowerCase();
          const tierColor = `var(--tier-${tierKey})`;
          const tierBg = `var(--tier-${tierKey}-bg)`;
          const tierBorder = `var(--tier-${tierKey}-border)`;
          const cardBgGradient = TIER_BG_GRADIENTS[tierKey] || TIER_BG_GRADIENTS.z;
          
          return (
            <div className="prydwen-tier-row" key={tierLetter} style={{
              display: 'flex',
              background: 'rgba(13, 20, 33, 0.45)',
              border: '1px solid var(--border-light)',
              borderRadius: '12px',
              overflow: 'hidden',
            }}>
              {/* Left Column: Solid Tier Header Badge */}
              <div 
                className="prydwen-tier-header" 
                style={{ 
                  backgroundColor: tierBg, 
                  color: tierColor,
                  borderRight: `2px solid ${tierBorder}`,
                  minWidth: '90px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '16px 8px',
                  fontWeight: 900,
                  fontSize: '28px',
                  textTransform: 'uppercase',
                  flexShrink: 0
                }}
              >
                <span>{tierLetter}</span>
                <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', marginTop: '2px', letterSpacing: '0.5px' }}>
                  {tierInfo.casual_name || 'Tier'}
                </span>
              </div>
              
              {/* Right Column: Grid of square portrait cards */}
              <div className="prydwen-items-grid" style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '12px',
                padding: '14px',
                alignItems: 'flex-start',
                flexGrow: 1,
              }}>
                {tierInfo.items.map(item => {
                  // eslint-disable-next-line no-unused-vars
                  const { _searchName, _searchDesc, ...publicItem } = item;
                  const { cleanName, tags } = extractTierTags(item.name);
                  const imageUrl = getItemImage(item.name, selectedCategory);
                  const isNew = isNewTierItem(item.name);
                  const role = robotRolesMap[cleanKey(cleanName)] || '';
                  const specIconUrl = getSpecializationIcon(role);

                  return (
                    <div
                      className="prydwen-card"
                      key={item.name}
                      onClick={() => onItemClick(item.name, selectedCategory, publicItem)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onItemClick(item.name, selectedCategory, publicItem);
                        }
                      }}
                      tabIndex={0}
                      role="button"
                      aria-label={`View details for ${cleanName}`}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        width: '105px',
                        cursor: 'pointer',
                        userSelect: 'none',
                        transition: 'transform 0.2s ease',
                      }}
                    >
                      {/* Portrait Wrapper allowing tags to bubble out */}
                      <div
                        className="prydwen-portrait-wrapper"
                        style={{
                          position: 'relative',
                          width: '105px',
                          height: '105px',
                        }}
                      >
                        {/* Square Portrait Container */}
                        <div
                          className="prydwen-portrait-container"
                          style={{
                            width: '100%',
                            height: '100%',
                            borderRadius: '10px',
                            overflow: 'hidden',
                            background: cardBgGradient,
                            border: `1.5px solid ${tierBorder}`,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.35)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative',
                          }}
                        >
                          {/* Item Artwork Image or Fallback */}
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={cleanName}
                              loading="lazy"
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                                transition: 'transform 0.2s ease',
                              }}
                              className="prydwen-portrait-img"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div style={{
                              fontSize: '24px',
                              opacity: 0.6,
                              textAlign: 'center',
                            }} aria-hidden="true">
                              🤖
                            </div>
                          )}

                          {/* Top-Left Corner: Specialization Icon / Role Badge */}
                          {(specIconUrl || role) && (
                            <div
                              style={{
                                position: 'absolute',
                                top: '4px',
                                left: '4px',
                                zIndex: 2,
                                background: 'rgba(13, 20, 31, 0.9)',
                                borderRadius: '4px',
                                padding: '2px 5px',
                                display: 'flex',
                                alignItems: 'center',
                                backdropFilter: 'blur(4px)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.4)',
                              }}
                              title={role ? `Specialization: ${role}` : ''}
                            >
                              {specIconUrl ? (
                                <img src={specIconUrl} alt="" style={{ width: '14px', height: '14px', objectFit: 'contain' }} />
                              ) : (
                                <span style={{ fontSize: '9px', fontWeight: 800, color: 'var(--cyan)', lineHeight: 1 }}>
                                  {role.slice(0, 3).toUpperCase()}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Bottom-Right Corner: "New" Badge */}
                          {isNew && (
                            <div
                              style={{
                                position: 'absolute',
                                bottom: '4px',
                                right: '4px',
                                zIndex: 2,
                                background: '#ef4444',
                                color: '#fff',
                                fontSize: '9px',
                                fontWeight: 900,
                                padding: '1px 5px',
                                borderRadius: '4px',
                                boxShadow: '0 2px 4px rgba(239, 68, 68, 0.5)',
                                letterSpacing: '0.5px',
                                textTransform: 'uppercase',
                                lineHeight: 1.2,
                              }}
                            >
                              NEW
                            </div>
                          )}
                        </div>

                        {/* Top-Right Corner: Tags bubbling out from the border with solid border */}
                        {tags.length > 0 && (
                          <div
                            style={{
                              position: 'absolute',
                              top: '-8px',
                              right: '-8px',
                              zIndex: 10,
                              display: 'flex',
                              gap: '4px',
                            }}
                          >
                            {tags.map((tag, tidx) => (
                              <span
                                key={tidx}
                                style={{
                                  fontSize: '12px',
                                  lineHeight: 1,
                                  background: '#0d131f',
                                  border: `2px solid ${tierBorder}`,
                                  borderRadius: '9999px',
                                  padding: '3px 5px',
                                  boxShadow: '0 3px 8px rgba(0, 0, 0, 0.7)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Name below the portrait */}
                      <span
                        style={{
                          marginTop: '6px',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#fff',
                          textAlign: 'center',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: '105px',
                          lineHeight: 1.3,
                        }}
                        title={cleanName}
                      >
                        {cleanName}
                      </span>

                      {/* Accessible description for search & screen readers */}
                      <span className="sr-only">
                        {item.description}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Tier list tag legend */}
      <div className="tier-marker-legend" aria-label="Tier list marker meanings" style={{ marginTop: '24px' }}>
        <p><strong>[👥]</strong> Items that are being ranked due to their potential in squad play. For solo matches, they go down one.</p>
        <p><strong>[‼️]</strong> Items that require an incredibly specific build in order to perform at the tier they are ranked at. Read the rationale for these items to learn what build is high tier. Generally, these items are much lower tier than shown if not used with that specific build.</p>
        <p><strong>[⬆️]</strong> Items that are normally low tier but have the potential to perform at a much higher tier than listed due to current meta circumstances. Read the rationale for these items for more info.</p>
        <p><strong>[⬇️]</strong> Items that are normally high tier but will likely perform worse than usual at the moment due to current meta circumstances. Read the rationale for these items for more info.</p>
        <p><strong>[👁️]</strong> Items so powerful that the meta is being bent around them. [⬆️] and [⬇️] tags are based on these.</p>
      </div>
    </div>
  );
}
