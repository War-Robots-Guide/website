import { useState, useMemo, useEffect } from 'react';
import robotGuideData from '../../data/robot_guide.json';
import { sortBySearchQuery } from '../../utils/sortUtils';
import { getDescriptionForName } from '../../utils/tierLookup';
import { RobotCard } from './RobotCard';
import { TitanCard } from './TitanCard';
import { GuideFilters } from './GuideFilters';

export function RobotsGuideTab({ onItemClick }) {
  const [guideSubTab, setGuideSubTab] = useState('robots');
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [robotValueFilter, setRobotValueFilter] = useState('All');
  const [robotRoleFilter, setRobotRoleFilter] = useState('All');

  const handleCardClick = (item, category) => {
    if (!onItemClick) return;

    let description = getDescriptionForName(item.name, category);

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
      filtered = sortBySearchQuery(filtered, query, (robot) => robot.name);
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
      filtered = sortBySearchQuery(filtered, query, (titan) => titan.name);
    }

    return filtered;
  }, [searchQuery, robotValueFilter]);

  const availableRatings = useMemo(() => {
    const items = guideSubTab === 'robots' ? robotGuideData?.robots : robotGuideData?.titans;
    if (!items) return [];
    const ratings = items.map(item => item.value_rating);
    return Array.from(new Set(ratings)).sort((a, b) => b - a);
  }, [guideSubTab]);

  return (
    <div className="animate-fade-in text-left">
      <div className="hero-banner" style={{ padding: '24px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '28px', marginBottom: '8px' }}>Value Ratings</h2>
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
          Robots
        </button>
        <button 
          className={`tab-pill ${guideSubTab === 'titans' ? 'active' : ''}`} 
          onClick={() => { setGuideSubTab('titans'); setRobotRoleFilter('All'); setRobotValueFilter('All'); setSearchInput(''); setSearchQuery(''); }}
        >
          Titans
        </button>
      </div>

      {/* Filter controls */}
      <GuideFilters
        guideSubTab={guideSubTab}
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        robotValueFilter={robotValueFilter}
        setRobotValueFilter={setRobotValueFilter}
        robotRoleFilter={robotRoleFilter}
        setRobotRoleFilter={setRobotRoleFilter}
        availableRatings={availableRatings}
      />


      {/* Robots/Titans Grid */}
      <div className="dashboard-grid">
        {guideSubTab === 'robots'
          ? filteredRobots.map(robot => (
              <RobotCard
                key={robot.name}
                robot={robot}
                onClick={handleCardClick}
                robotGuideData={robotGuideData}
              />
            ))
          : filteredTitans.map(titan => (
              <TitanCard
                key={titan.name}
                titan={titan}
                onClick={handleCardClick}
              />
            ))
        }
      </div>

    </div>
  );
}
