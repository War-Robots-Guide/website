import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import robotGuideData from '../../data/robot_guide.json';
import { sortBySearchQuery } from '../../utils/sortUtils';
import { RobotCard } from './RobotCard';
import { TitanCard } from './TitanCard';
import { GuideFilters } from './GuideFilters';

export function RobotsGuideTab({ onItemClick }) {
  const [guideSubTab, setGuideSubTab] = useState('robots');
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [robotValueFilter, setRobotValueFilter] = useState('All');
  const [robotRoleFilter, setRobotRoleFilter] = useState('All');
  const [statFilter, setStatFilter] = useState('All');
  const [minScoreFilter, setMinScoreFilter] = useState('All');
  const [sortBy, setSortBy] = useState('Default');

  // Lazy loading state
  const [visibleCount, setVisibleCount] = useState(12);

  const handleCardClick = (item, category) => {
    if (!onItemClick) return;

    const description = item.comments;

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

  // Reset lazy loading count when any filters or active tab change without useEffect
  const [prevFilterState, setPrevFilterState] = useState({
    guideSubTab,
    searchQuery,
    robotValueFilter,
    robotRoleFilter,
    statFilter,
    minScoreFilter,
    sortBy,
  });

  if (
    guideSubTab !== prevFilterState.guideSubTab ||
    searchQuery !== prevFilterState.searchQuery ||
    robotValueFilter !== prevFilterState.robotValueFilter ||
    robotRoleFilter !== prevFilterState.robotRoleFilter ||
    statFilter !== prevFilterState.statFilter ||
    minScoreFilter !== prevFilterState.minScoreFilter ||
    sortBy !== prevFilterState.sortBy
  ) {
    setPrevFilterState({
      guideSubTab,
      searchQuery,
      robotValueFilter,
      robotRoleFilter,
      statFilter,
      minScoreFilter,
      sortBy,
    });
    setVisibleCount(12);
  }

  const filteredRobots = useMemo(() => {
    if (!robotGuideData?.robots) return [];
    const query = searchQuery.toLowerCase().trim();
    
    let filtered = robotGuideData.robots.filter(robot => {
      const matchSearch = robot.name.toLowerCase().includes(query) || 
                          robot.comments.toLowerCase().includes(query);
      
      const matchValue = robotValueFilter === 'All' || robot.value_rating === parseInt(robotValueFilter);
      
      const matchRole = robotRoleFilter === 'All' || 
                        robot.roles.some(r => r.role === robotRoleFilter && r.type !== 'none');
      
      let matchStat = true;
      if (statFilter !== 'All' && minScoreFilter !== 'All') {
        const score = robot.scores?.[statFilter];
        matchStat = score !== undefined && score >= parseInt(minScoreFilter);
      }
      
      return matchSearch && matchValue && matchRole && matchStat;
    });

    if (sortBy !== 'Default') {
      filtered = [...filtered].sort((a, b) => {
        const valA = sortBy === 'value_rating' ? a.value_rating : (a.scores?.[sortBy] ?? -999);
        const valB = sortBy === 'value_rating' ? b.value_rating : (b.scores?.[sortBy] ?? -999);
        return valB - valA;
      });
    } else if (query) {
      filtered = sortBySearchQuery(filtered, query, (robot) => robot.name);
    }

    return filtered;
  }, [searchQuery, robotValueFilter, robotRoleFilter, statFilter, minScoreFilter, sortBy]);

  const filteredTitans = useMemo(() => {
    if (!robotGuideData?.titans) return [];
    const query = searchQuery.toLowerCase().trim();
    
    let filtered = robotGuideData.titans.filter(titan => {
      const matchSearch = titan.name.toLowerCase().includes(query) || 
                          titan.comments.toLowerCase().includes(query);
      
      const matchValue = robotValueFilter === 'All' || titan.value_rating === parseInt(robotValueFilter);
      
      let matchStat = true;
      if (statFilter !== 'All' && minScoreFilter !== 'All') {
        const score = titan.scores?.[statFilter];
        matchStat = score !== undefined && score >= parseInt(minScoreFilter);
      }
      
      return matchSearch && matchValue && matchStat;
    });

    if (sortBy !== 'Default') {
      filtered = [...filtered].sort((a, b) => {
        const valA = sortBy === 'value_rating' ? a.value_rating : (a.scores?.[sortBy] ?? -999);
        const valB = sortBy === 'value_rating' ? b.value_rating : (b.scores?.[sortBy] ?? -999);
        return valB - valA;
      });
    } else if (query) {
      filtered = sortBySearchQuery(filtered, query, (titan) => titan.name);
    }

    return filtered;
  }, [searchQuery, robotValueFilter, statFilter, minScoreFilter, sortBy]);

  // Paginated visible items lists
  const visibleRobots = useMemo(() => {
    return filteredRobots.slice(0, visibleCount);
  }, [filteredRobots, visibleCount]);

  const visibleTitans = useMemo(() => {
    return filteredTitans.slice(0, visibleCount);
  }, [filteredTitans, visibleCount]);

  // IntersectionObserver callback ref for infinite scrolling
  const observerRef = useRef(null);
  const sentinelRef = useCallback((node) => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setVisibleCount((prev) => prev + 12);
      }
    }, { rootMargin: '200px' });

    if (node) observerRef.current.observe(node);
  }, []);

  // Cleanup observer on unmount
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

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
          onClick={() => { 
            setGuideSubTab('robots'); 
            setRobotRoleFilter('All'); 
            setRobotValueFilter('All'); 
            setStatFilter('All');
            setMinScoreFilter('All');
            setSortBy('Default');
            setSearchInput(''); 
            setSearchQuery(''); 
          }}
        >
          Robots
        </button>
        <button 
          className={`tab-pill ${guideSubTab === 'titans' ? 'active' : ''}`} 
          onClick={() => { 
            setGuideSubTab('titans'); 
            setRobotRoleFilter('All'); 
            setRobotValueFilter('All'); 
            setStatFilter('All');
            setMinScoreFilter('All');
            setSortBy('Default');
            setSearchInput(''); 
            setSearchQuery(''); 
          }}
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
        statFilter={statFilter}
        setStatFilter={setStatFilter}
        minScoreFilter={minScoreFilter}
        setMinScoreFilter={setMinScoreFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        availableRatings={availableRatings}
      />


      {/* Robots/Titans Grid */}
      <div className="dashboard-grid">
        {guideSubTab === 'robots'
          ? visibleRobots.map(robot => (
              <RobotCard
                key={robot.name}
                robot={robot}
                onClick={handleCardClick}
                robotGuideData={robotGuideData}
              />
            ))
          : visibleTitans.map(titan => (
              <TitanCard
                key={titan.name}
                titan={titan}
                onClick={handleCardClick}
              />
            ))
        }
      </div>

      {/* Sentinel element for infinite scroll */}
      {((guideSubTab === 'robots' && visibleCount < filteredRobots.length) ||
        (guideSubTab === 'titans' && visibleCount < filteredTitans.length)) && (
        <div 
          ref={sentinelRef} 
          style={{ height: '20px', margin: '20px 0' }} 
        />
      )}

    </div>
  );
}
