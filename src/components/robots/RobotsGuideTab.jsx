import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import robotGuideData from '../../data/robot_guide.json';
import { sortBySearchQuery } from '../../utils/sortUtils';
import { RobotCard } from './RobotCard';
import { TitanCard } from './TitanCard';
import { GuideFilters } from './GuideFilters';
import { SlidingTabPills } from '../common/SlidingTabPills';
import { getTierForName } from '../../utils/tierLookup';

export function RobotsGuideTab({ onItemClick }) {
  const [guideSubTab, setGuideSubTab] = useState('robots');
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [robotValueFilter, setRobotValueFilter] = useState('All');
  const [robotRoleFilter, setRobotRoleFilter] = useState('All');
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
    categoryFilter,
    robotValueFilter,
    robotRoleFilter,
    sortBy,
  });

  if (
    guideSubTab !== prevFilterState.guideSubTab ||
    searchQuery !== prevFilterState.searchQuery ||
    categoryFilter !== prevFilterState.categoryFilter ||
    robotValueFilter !== prevFilterState.robotValueFilter ||
    robotRoleFilter !== prevFilterState.robotRoleFilter ||
    sortBy !== prevFilterState.sortBy
  ) {
    setPrevFilterState({
      guideSubTab,
      searchQuery,
      categoryFilter,
      robotValueFilter,
      robotRoleFilter,
      sortBy,
    });
    setVisibleCount(12);
  }

  const availableCategories = useMemo(() => {
    if (!robotGuideData?.robots) return [];
    const sheets = robotGuideData.robots.map(r => r.sheet);
    return Array.from(new Set(sheets));
  }, []);

  const filteredRobots = useMemo(() => {
    if (!robotGuideData?.robots) return [];
    const query = searchQuery.toLowerCase().trim();
    
    let filtered = robotGuideData.robots.filter(robot => {
      const matchSearch = robot.name.toLowerCase().includes(query) || 
                          robot.comments.toLowerCase().includes(query);
      
      const matchCategory = categoryFilter === 'All' || robot.sheet === categoryFilter;

      let matchValue = true;
      if (robotValueFilter !== 'All') {
        if (typeof robotValueFilter === 'string' && robotValueFilter.includes('-')) {
          const [min, max] = robotValueFilter.split('-').map(Number);
          matchValue = robot.value_rating >= min && robot.value_rating <= max;
        } else {
          matchValue = robot.value_rating === parseInt(robotValueFilter, 10);
        }
      }
      
      const matchRole = robotRoleFilter === 'All' || 
                        robot.roles.some(r => r.role === robotRoleFilter && r.type !== 'none');
      
      return matchSearch && matchCategory && matchValue && matchRole;
    });

    if (sortBy === 'value_rating') {
      filtered = [...filtered].sort((a, b) => b.value_rating - a.value_rating);
    } else {
      // Default Sort: Sort by Tiers (highest to lowest)
      const getTierWeight = (item, category) => {
        const tier = getTierForName(item.name, category);
        const TIER_ORDER = { 'X': 9, 'S': 8, 'A': 7, 'B': 6, 'C': 5, 'D': 4, 'E': 3, 'F': 2, 'Z': 1 };
        return TIER_ORDER[tier] ?? 0;
      };
      filtered = [...filtered].sort((a, b) => {
        return getTierWeight(b, 'Robots') - getTierWeight(a, 'Robots');
      });
      if (query) {
        filtered = sortBySearchQuery(filtered, query, (robot) => robot.name);
      }
    }

    return filtered;
  }, [searchQuery, categoryFilter, robotValueFilter, robotRoleFilter, sortBy]);

  const filteredTitans = useMemo(() => {
    if (!robotGuideData?.titans) return [];
    const query = searchQuery.toLowerCase().trim();
    
    let filtered = robotGuideData.titans.filter(titan => {
      const matchSearch = titan.name.toLowerCase().includes(query) || 
                          titan.comments.toLowerCase().includes(query);
      
      let matchValue = true;
      if (robotValueFilter !== 'All') {
        if (typeof robotValueFilter === 'string' && robotValueFilter.includes('-')) {
          const [min, max] = robotValueFilter.split('-').map(Number);
          matchValue = titan.value_rating >= min && titan.value_rating <= max;
        } else {
          matchValue = titan.value_rating === parseInt(robotValueFilter, 10);
        }
      }
      
      return matchSearch && matchValue;
    });

    if (sortBy === 'value_rating') {
      filtered = [...filtered].sort((a, b) => b.value_rating - a.value_rating);
    } else {
      // Default Sort: Sort by Tiers (highest to lowest)
      const getTierWeight = (item, category) => {
        const tier = getTierForName(item.name, category);
        const TIER_ORDER = { 'X': 9, 'S': 8, 'A': 7, 'B': 6, 'C': 5, 'D': 4, 'E': 3, 'F': 2, 'Z': 1 };
        return TIER_ORDER[tier] ?? 0;
      };
      filtered = [...filtered].sort((a, b) => {
        return getTierWeight(b, 'Titans') - getTierWeight(a, 'Titans');
      });
      if (query) {
        filtered = sortBySearchQuery(filtered, query, (titan) => titan.name);
      }
    }

    return filtered;
  }, [searchQuery, robotValueFilter, sortBy]);

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

  return (
    <div className="animate-fade-in text-left">
      <div className="hero-banner" style={{ padding: '24px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '28px', marginBottom: '8px' }}>Value Ratings</h2>
        <p style={{ margin: '0 auto' }}>
          Value rating represents F2P friendliness and return on investment.
        </p>
      </div>

      {/* Sub Tabs: Robots vs Titans */}
      <SlidingTabPills
        tabs={[
          { label: 'Robots', value: 'robots' },
          { label: 'Titans', value: 'titans' }
        ]}
        activeTab={guideSubTab}
        onChange={(val) => {
          setGuideSubTab(val);
          setCategoryFilter('All');
          setRobotRoleFilter('All');
          setRobotValueFilter('All');
          setSortBy('Default');
          setSearchInput('');
          setSearchQuery('');
        }}
      />

      {/* Filter controls */}
      <GuideFilters
        guideSubTab={guideSubTab}
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        availableCategories={availableCategories}
        robotValueFilter={robotValueFilter}
        setRobotValueFilter={setRobotValueFilter}
        robotRoleFilter={robotRoleFilter}
        setRobotRoleFilter={setRobotRoleFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
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

      {/* Role Notes & Conditional Requirements Legend */}
      {robotGuideData?.footnotes && robotGuideData.footnotes.length > 0 && (
        <div className="glass-panel" style={{ marginTop: '28px', padding: '18px 22px' }}>
          <h4 style={{ fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px', fontWeight: 600, letterSpacing: '0.05em' }}>
            Role Notes & Conditional Requirements
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {robotGuideData.footnotes.map((fn, idx) => (
              <div key={idx} style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                <strong style={{ color: 'var(--cyan)' }}>{fn.match(/^\*+/)?.[0]}</strong> {fn.replace(/^\*+/, '').trim()}
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
