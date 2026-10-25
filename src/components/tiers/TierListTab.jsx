import { GuideDisclosure } from '../common/GuideDisclosure';
import { PageHero } from '../common/PageHero';
import { RoleGuide } from '../common/RoleGuide';
import { useState, useMemo } from 'react';
import tiersData from '../../data/tiers.json';
import robotGuideData from '../../data/robot_guide.json';
import { getEquipmentAppearance } from '../../utils/equipmentTiers';
import { SearchInput } from '../common/SearchInput';
import { SlidingTabPills } from '../common/SlidingTabPills';
import { getItemImage, extractTierTags, isNewTierItem, getRoleIcon, getUnitKey } from '../../utils/imageUtils';

// Pre-compute lowercased names and descriptions once outside the component
const optimizedTiersData = tiersData ? JSON.parse(JSON.stringify(tiersData)) : {};
if (optimizedTiersData) {
  Object.keys(optimizedTiersData).forEach(cat => {
    if (cat === 'disclaimers') return;
    Object.keys(optimizedTiersData[cat]).forEach(tierLetter => {
      if (cat.includes('Weapons')) {
        optimizedTiersData[cat][tierLetter].items = optimizedTiersData[cat][tierLetter].items.flatMap(item =>
          item.name.split(/[,/.]/).map(name => name.trim()).filter(Boolean).map(name => ({ ...item, name, family_name: item.name }))
        );
      }
      optimizedTiersData[cat][tierLetter].items.forEach(item => {
        item._searchName = (item.family_name || item.name).toLowerCase();
        item._searchDesc = item.description.toLowerCase();
      });
    });
  });
}

export function TierListTab({ onItemClick }) {
  const [selectedCategory, setSelectedCategory] = useState('Robots');
  const [searchQuery, setSearchQuery] = useState('');

  const robotRolesMap = useMemo(() => {
    const map = {};
    if (robotGuideData?.robots) {
      robotGuideData.robots.forEach(r => {
        const mainRole = r.roles?.find(role => role.type === 'main')?.role;
        if (mainRole) map[getUnitKey(r.name)] = mainRole;
      });
    }
    if (robotGuideData?.titans) {
      robotGuideData.titans.forEach(t => {
        const mainRole = t.roles?.find(role => role.type === 'main')?.role;
        if (mainRole) map[getUnitKey(t.name)] = mainRole;
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
      <PageHero title="Tier Lists">
        A power based tier list ranking every unit and item in the game. Click any card to inspect roles and rationales.
      </PageHero>

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

      <GuideDisclosure title="Tier Tag Guide">
          <div className="tier-marker-legend" aria-label="Tier list marker meanings">
            <div className="tier-tag-row">
              <span className="tier-tag-icon">👥</span>
              <span><strong>[👥] Squad Play:</strong> Items that are being ranked due to their potential in squad play. For solo matches, they go down one.</span>
            </div>
            <div className="tier-tag-row">
              <span className="tier-tag-icon">‼️</span>
              <span><strong>[‼️] Specific Build:</strong> Items that require an incredibly specific build in order to perform at the tier they are ranked at. Read the rationale for these items to learn what build is high tier. Generally, these items are much lower tier than shown if not used with that specific build.</span>
            </div>
            <div className="tier-tag-row">
              <span className="tier-tag-icon">⬆️</span>
              <span><strong>[⬆️] Meta Overperformer:</strong> Items that are normally low tier but have the potential to perform at a much higher tier than listed due to current meta circumstances. Read the rationale for these items for more info.</span>
            </div>
            <div className="tier-tag-row">
              <span className="tier-tag-icon">⬇️</span>
              <span><strong>[⬇️] Meta Underperformer:</strong> Items that are normally high tier but will likely perform worse than usual at the moment due to current meta circumstances. Read the rationale for these items for more info.</span>
            </div>
            <div className="tier-tag-row">
              <span className="tier-tag-icon">👁️</span>
              <span><strong>[👁️] Meta Definer:</strong> Items so powerful that the meta is being bent around them. [⬆️] and [⬇️] tags are based on these.</span>
            </div>
            <RoleGuide category={selectedCategory} />
          </div>
      </GuideDisclosure>

      {/* Prydwen Style Tier List Rows */}
      <div className="prydwen-tierlist-container" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {['X', 'S', 'A', 'B', 'C', 'D', 'E', 'F', 'Z'].map(tierLetter => {
          const tierInfo = filteredTiers[tierLetter];
          if (!tierInfo || tierInfo.items.length === 0) return null;
          
          const tierKey = tierLetter.toLowerCase();
          const tierColor = `var(--tier-${tierKey})`;
          const tierBg = `var(--tier-${tierKey}-bg)`;
          const tierBorder = `var(--tier-${tierKey}-border)`;

          
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
                <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', marginTop: '2px', textTransform: 'uppercase' }}>
                  Tier
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
                  const isNew = isNewTierItem(item.name, selectedCategory);
                  const mainRole = robotRolesMap[getUnitKey(cleanName)] || '';
                  const roleIconUrl = getRoleIcon(mainRole);
                  const appearance = getEquipmentAppearance(cleanName, selectedCategory);

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
                      {/* Prydwen Square Portrait Container */}
                      <div
                        className="prydwen-portrait-container"
                        style={{
                          position: 'relative',
                          width: '105px',
                          height: '105px',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          background: appearance.background,
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          borderBottom: `4px solid ${appearance.color}`,
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.45)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
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
                              padding: '6px',
                              boxSizing: 'border-box',
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

                        {/* Top-Left Corner: Main Role Icon */}
                        {roleIconUrl && (
                          <div
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              zIndex: 2,
                              background: '#11141a',
                              borderBottomRightRadius: '6px',
                              padding: '3px 5px',
                              minWidth: '22px',
                              height: '22px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
                            }}
                            title={mainRole ? `Main Role: ${mainRole}` : ''}
                          >
                            <img
                              src={roleIconUrl}
                              alt={mainRole}
                              style={{ width: '16px', height: '16px', objectFit: 'contain' }}
                            />
                          </div>
                        )}

                        {/* Top-Right Corner: Flush directly at the edge */}
                        {tags.length > 0 && (
                          <div
                            style={{
                              position: 'absolute',
                              top: 0,
                              right: 0,
                              zIndex: 2,
                              background: '#11141a',
                              borderBottomLeftRadius: '6px',
                              padding: '2px 5px',
                              height: '22px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '2px',
                              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
                            }}
                          >
                            {tags.map((tag, tidx) => (
                              <span
                                key={tidx}
                                style={{
                                  fontSize: '11px',
                                  lineHeight: 1,
                                }}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Bottom-Right Corner: Flush directly at the edge (like C0 badge in reference) */}
                        {isNew && (
                          <div
                            style={{
                              position: 'absolute',
                              bottom: 0,
                              right: 0,
                              zIndex: 2,
                              background: '#dc2626',
                              color: '#fff',
                              fontSize: '10px',
                              fontWeight: 900,
                              padding: '2px 6px',
                              borderTopLeftRadius: '4px',
                              boxShadow: '0 -1px 4px rgba(0, 0, 0, 0.4)',
                              letterSpacing: '0.5px',
                              textTransform: 'uppercase',
                              lineHeight: 1.1,
                            }}
                          >
                            NEW
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
    </div>
  );
}
