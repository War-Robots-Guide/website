import { useState, useMemo, useEffect } from 'react';
import { Search } from 'lucide-react';
import robotGuideData from '../../data/robot_guide.json';
import { RatingBar } from '../common/RatingBar';
import { ScoreMeter } from '../common/ScoreMeter';

export function RobotsGuideTab() {
  const [guideSubTab, setGuideSubTab] = useState('robots');
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [robotValueFilter, setRobotValueFilter] = useState('All');
  const [robotRoleFilter, setRobotRoleFilter] = useState('All');

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
    const query = searchQuery.toLowerCase();
    
    return robotGuideData.robots.filter(robot => {
      const matchSearch = robot.name.toLowerCase().includes(query) || 
                          robot.comments.toLowerCase().includes(query);
      
      const matchValue = robotValueFilter === 'All' || robot.value_rating === parseInt(robotValueFilter);
      
      const matchRole = robotRoleFilter === 'All' || 
                        robot.roles.some(r => r.role === robotRoleFilter && r.type !== 'none');
      
      return matchSearch && matchValue && matchRole;
    });
  }, [searchQuery, robotValueFilter, robotRoleFilter]);

  const filteredTitans = useMemo(() => {
    if (!robotGuideData?.titans) return [];
    const query = searchQuery.toLowerCase();
    
    return robotGuideData.titans.filter(titan => {
      const matchSearch = titan.name.toLowerCase().includes(query) || 
                          titan.comments.toLowerCase().includes(query);
      
      const matchValue = robotValueFilter === 'All' || titan.value_rating === parseInt(robotValueFilter);
      
      return matchSearch && matchValue;
    });
  }, [searchQuery, robotValueFilter]);

  return (
    <div className="animate-fade-in text-left">
      <div className="hero-banner" style={{ padding: '24px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '28px', marginBottom: '8px' }}>Detailed Value Ratings & Scores</h2>
        <p style={{ margin: '0 auto' }}>
          Deep dive evaluations of Robots and Titans. Value rating represents F2P friendliness and return on investment. 
          Detailed scores range from <span style={{ color: '#ef4444' }}>-2 (Horrible)</span> to <span style={{ color: '#10b981' }}>+3 (Excellent)</span>.
        </p>
      </div>

      {/* Sub Tabs: Robots vs Titans */}
      <div className="segmented-control" style={{ maxWidth: '300px' }}>
        <div 
          className="segmented-control-slider" 
          style={{ transform: `translateX(${guideSubTab === 'titans' ? '100%' : '0%'})` }}
        />
        <button 
          className={`segmented-control-btn ${guideSubTab === 'robots' ? 'active' : ''}`} 
          onClick={() => { setGuideSubTab('robots'); setRobotRoleFilter('All'); setRobotValueFilter('All'); setSearchInput(''); setSearchQuery(''); }}
        >
          Robots Guide
        </button>
        <button 
          className={`segmented-control-btn ${guideSubTab === 'titans' ? 'active' : ''}`} 
          onClick={() => { setGuideSubTab('titans'); setRobotRoleFilter('All'); setRobotValueFilter('All'); setSearchInput(''); setSearchQuery(''); }}
        >
          Titans Guide
        </button>
      </div>

      {/* Filter controls */}
      <div className="search-container">
        <div className="search-input-wrapper">
          <Search size={18} className="search-input-icon" />
          <input 
            type="text" 
            className="search-input" 
            placeholder={`Search ${guideSubTab}...`}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>

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
            <div className="glass-panel glass-panel-hover robot-card" key={robot.name}>
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
                  {robot.roles.map(role => (
                    <span 
                      className={`role-badge ${role.type}`} 
                      key={role.role}
                      title={role.footnote ? `Requirement: ${role.footnote}` : ''}
                    >
                      {role.role}
                      {role.type === 'primary' && ' (Primary)'}
                      {role.type === 'secondary' && ' (Secondary)'}
                      {role.footnote && <sup style={{ color: 'var(--text-muted)', marginLeft: '2px' }}>{role.footnote}</sup>}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        // Titans Grid
        <div className="dashboard-grid">
          {filteredTitans.map(titan => (
            <div className="glass-panel glass-panel-hover robot-card" key={titan.name}>
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
