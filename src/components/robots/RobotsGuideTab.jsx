import { useState, useMemo, useEffect } from 'react';
import robotGuideData from '../../data/robot_guide.json';
import tiersData from '../../data/tiers.json';
import { RatingBar } from '../common/RatingBar';
import { SearchInput } from '../common/SearchInput';
import { ScoreMeter } from '../common/ScoreMeter';

export function RobotsGuideTab({ onItemClick }) {
  const [guideSubTab, setGuideSubTab] = useState('robots');
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [robotValueFilter, setRobotValueFilter] = useState('All');
  const [robotRoleFilter, setRobotRoleFilter] = useState('All');

  const handleCardClick = (item, category) => {
    if (!onItemClick) return;

    let description = '';
    const cleanName = item.name.replace(/\*+$/, '').trim().toLowerCase();
    const isUe = cleanName.startsWith('ue ');

    if (tiersData && tiersData[category]) {
      const catData = tiersData[category];
      for (const tierLetter of Object.keys(catData)) {
        const found = catData[tierLetter].items.find(tItem => {
          const tClean = tItem.name.replace(/\*+$/, '').trim().toLowerCase();
          const tIsUe = tClean.startsWith('ue ');
          if (isUe !== tIsUe) return false;
          return tClean === cleanName || cleanName.includes(tClean) || tClean.includes(cleanName);
        });
        if (found) {
          description = found.description;
          break;
        }
      }
    }

    if (!description) {
      description = item.comments;
    }

    onItemClick(item.name, category, { description });
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchQuery(searchInput);
    }, 250);
    return () => {
      clearTimeout(handler);
    };
  }, [searchInput]);

  const filteredRobots = useMemo(() => {
    if (!robotGuideData?.robots) return [];
    const query = searchQuery.toLowerCase().trim();
    
    let filtered = robotGuideData.robots.filter(robot => {
      const matchSearch = robot.name.toLowerCase().includes(query) || 
                          robot.comments.toLowerCase().includes(query);
      
      const matchValue = robotValueFilter === 'All' || robot.value_rating === parseInt(robotValueFilter);
      
      const matchRole = robotRoleFilter === 'All' || 
                        robot.roles.some(r => r.role === robotRoleFilter && r.type !== 'none');
      
      return matchSearch && matchValue && matchRole;
    });

    if (query) {
      filtered = [...filtered].sort((a, b) => {
        const aName = a.name.toLowerCase();
        const bName = b.name.toLowerCase();
        
        const aExact = aName === query;
        const bExact = bName === query;
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        
        const aStarts = aName.startsWith(query);
        const bStarts = bName.startsWith(query);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        
        const aIncludes = aName.includes(query);
        const bIncludes = bName.includes(query);
        if (aIncludes && !bIncludes) return -1;
        if (!aIncludes && bIncludes) return 1;
        
        return 0;
      });
    }

    return filtered;
  }, [searchQuery, robotValueFilter, robotRoleFilter]);

  const filteredTitans = useMemo(() => {
    if (!robotGuideData?.titans) return [];
    const query = searchQuery.toLowerCase().trim();
    
    let filtered = robotGuideData.titans.filter(titan => {
      const matchSearch = titan.name.toLowerCase().includes(query) || 
                          titan.comments.toLowerCase().includes(query);
      
      const matchValue = robotValueFilter === 'All' || titan.value_rating === parseInt(robotValueFilter);
      
      return matchSearch && matchValue;
    });

    if (query) {
      filtered = [...filtered].sort((a, b) => {
        const aName = a.name.toLowerCase();
        const bName = b.name.toLowerCase();
        
        const aExact = aName === query;
        const bExact = bName === query;
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        
        const aStarts = aName.startsWith(query);
        const bStarts = bName.startsWith(query);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        
        const aIncludes = aName.includes(query);
        const bIncludes = bName.includes(query);
        if (aIncludes && !bIncludes) return -1;
        if (!aIncludes && bIncludes) return 1;
        
        return 0;
      });
    }

    return filtered;
  }, [searchQuery, robotValueFilter]);

  return (
    <div className="animate-fade-in text-left">
      <div className="hero-banner" style={{ padding: '24px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '28px', marginBottom: '8px' }}>Value Ratings & Scores</h2>
        <p style={{ margin: '0 auto' }}>
          Value rating represents F2P friendliness and return on investment.
        </p>
      </div>

      {/* Sub Tabs: Robots vs Titans */}
      <div className="tab-pills">
        <button 
          className={`tab-pill ${guideSubTab === 'robots' ? 'active' : ''}`} 
          onClick={() => { setGuideSubTab('robots'); setRobotRoleFilter('All'); setRobotValueFilter('All'); setSearchInput(''); setSearchQuery(''); }}
        >
          Robots Guide
        </button>
        <button 
          className={`tab-pill ${guideSubTab === 'titans' ? 'active' : ''}`} 
          onClick={() => { setGuideSubTab('titans'); setRobotRoleFilter('All'); setRobotValueFilter('All'); setSearchInput(''); setSearchQuery(''); }}
        >
          Titans Guide
        </button>
      </div>

      {/* Filter controls */}
      <div className="search-container">
        <SearchInput
          placeholder={`Search ${guideSubTab}...`}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />

        {/* Value rating filter */}
        <select 
          className="select-filter"
          value={robotValueFilter}
          onChange={(e) => setRobotValueFilter(e.target.value)}
        >
          <option value="All">All Value Ratings</option>
          {guideSubTab === 'robots' && (
            <>
              <option value="5">Value Rating 5</option>
              <option value="4">Value Rating 4</option>
            </>
          )}
          <option value="3">Value Rating 3</option>
          <option value="2">Value Rating 2</option>
          <option value="1">Value Rating 1</option>
          <option value="0">Value Rating 0</option>
          <option value="-1">Value Rating -1</option>
          <option value="-2">Value Rating -2</option>
        </select>

        {/* Roles filter (only for Robots) */}
        {guideSubTab === 'robots' && (
          <select 
            className="select-filter"
            value={robotRoleFilter}
            onChange={(e) => setRobotRoleFilter(e.target.value)}
          >
            <option value="All">All Hangar Roles</option>
            <option value="Support">Support</option>
            <option value="Tank-buster">Tank-Buster</option>
            <option value="Sniper">Sniper</option>
            <option value="Midrange">Midrange</option>
            <option value="Brawler">Brawler</option>
            <option value="Beacon Runner">Beacon Runner</option>
            <option value="Assassin">Assassin</option>
          </select>
        )}
      </div>

      {/* Robots Grid */}
      {guideSubTab === 'robots' ? (
        <div className="dashboard-grid">
          {filteredRobots.map(robot => (
            <div 
              className="glass-panel glass-panel-hover robot-card" 
              key={robot.name}
              onClick={() => handleCardClick(robot, 'Robots')}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCardClick(robot, 'Robots'); } }}
              tabIndex={0}
              role="button"
              aria-label={`View details for ${robot.name}`}
            >
              <div className="robot-card-header">
                <div>
                  <h3 style={{ fontSize: '20px', color: 'var(--cyan)' }}>{robot.name}</h3>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{robot.sheet}</span>
                </div>
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '2px', fontWeight: 600 }}>VALUE RATING</span>
                  <RatingBar rating={robot.value_rating} unitType="robot" align="right" />
                </div>
              </div>

              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '8px 0' }}>
                {robot.comments}
              </p>

              {/* Scores bars */}
              <div className="robot-scores">
                <ScoreMeter label="Longevity" score={robot.scores.longevity} />
                <ScoreMeter label="Lethality" score={robot.scores.lethality} />
                <ScoreMeter label="Mobility" score={robot.scores.mobility} />
                <ScoreMeter label="Utility" score={robot.scores.utility} />
                <ScoreMeter label="Accessibility" score={robot.scores.accessibility} />
                <ScoreMeter label="Overall Score" score={robot.scores.overall} />
              </div>

              {/* Roles Badges */}
              {robot.roles && robot.roles.length > 0 && (
                <div className="robot-roles">
                  {robot.roles.map(role => {
                    const tooltipText = role.footnote ? robotGuideData?.footnotes?.[parseInt(role.footnote) - 1] || role.footnote : '';
                    return (
                      <span
                        className={`role-badge ${role.type}`}
                        key={role.role}
                        title={tooltipText}
                      >
                        {role.role}
                        {role.type === 'primary' && ' (Primary)'}
                        {role.type === 'secondary' && ' (Secondary)'}
                        {role.footnote && <sup style={{ color: 'var(--text-muted)', marginLeft: '2px' }}>*</sup>}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        // Titans Grid
        <div className="dashboard-grid">
          {filteredTitans.map(titan => (
            <div 
              className="glass-panel glass-panel-hover robot-card" 
              key={titan.name}
              onClick={() => handleCardClick(titan, 'Titans')}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCardClick(titan, 'Titans'); } }}
              tabIndex={0}
              role="button"
              aria-label={`View details for ${titan.name}`}
            >
              <div className="robot-card-header">
                <div>
                  <h3 style={{ fontSize: '20px', color: 'var(--purple)' }}>{titan.name}</h3>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Titan Class</span>
                </div>
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '2px', fontWeight: 600 }}>VALUE RATING</span>
                  <RatingBar rating={titan.value_rating} unitType="titan" align="right" />
                </div>
              </div>

              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '8px 0' }}>
                {titan.comments}
              </p>

              {/* Scores bars */}
              <div className="robot-scores">
                <ScoreMeter label="Longevity" score={titan.scores.longevity} />
                <ScoreMeter label="Lethality" score={titan.scores.lethality} />
                <ScoreMeter label="Mobility" score={titan.scores.mobility} />
                <ScoreMeter label="Utility" score={titan.scores.utility} />
                <ScoreMeter label="Accessibility" score={titan.scores.accessibility} />
                <ScoreMeter label="Overall Score" score={titan.scores.overall} />
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
