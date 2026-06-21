import { useState, useMemo } from 'react';
import { 
  Search, Award, Shield, Zap, UserCheck, BarChart2, BookOpen, 
  Layers, RefreshCw, X, Star, Sparkles, Compass, CheckCircle2, XCircle
} from 'lucide-react';
import './App.css';

// Import parsed JSON data
import tiersData from './data/tiers.json';
import robotGuideData from './data/robot_guide.json';
import weaponsDpsData from './data/weapons_dps.json';
import specializationsData from './data/specializations.json';
import pilotsData from './data/pilots.json';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Robots'); // For Tier List tab
  const [selectedWeaponClass, setSelectedWeaponClass] = useState('Heavy Weapons'); // For Weapons tab
  const [robotValueFilter, setRobotValueFilter] = useState('All'); // For Robots tab
  const [robotRoleFilter, setRobotRoleFilter] = useState('All'); // For Robots tab
  const [pilotSubTab, setPilotSubTab] = useState('robots'); // 'robots' or 'titans'
  const [guideSubTab, setGuideSubTab] = useState('robots'); // 'robots' or 'titans' inside robot_guide
  
  // Weapon Comparison States
  const [compareList, setCompareList] = useState([]); // Array of weapon objects

  // Detailed Modal State
  const [selectedItem, setSelectedItem] = useState(null); // { name, type, data }

  // Hangar Analyzer States
  const [hangarRobots, setHangarRobots] = useState([null, null, null, null, null]);
  const [hangarTitan, setHangarTitan] = useState(null);
  const [activeSlot, setActiveSlot] = useState(null); // null, or 0-4 for robots, 5 for titan
  const [showSelectorModal, setShowSelectorModal] = useState(false);
  const [selectorSearchQuery, setSelectorSearchQuery] = useState('');


  // --------------------------------------------------
  // METADATA & STATS CALCULATIONS
  // --------------------------------------------------
  const stats = useMemo(() => {
    const totalRobots = robotGuideData?.robots?.length || 0;
    const totalTitans = robotGuideData?.titans?.length || 0;
    const totalBuilds = robotGuideData?.builds?.length || 0;
    
    let totalWeaponsCount = 0;
    if (weaponsDpsData) {
      Object.keys(weaponsDpsData).forEach(k => {
        totalWeaponsCount += weaponsDpsData[k]?.length || 0;
      });
    }
    
    const latestChange = robotGuideData?.changelog?.[0] || { date: 'N/A', text: 'No recent updates' };
    
    return {
      totalRobots,
      totalTitans,
      totalBuilds,
      totalWeapons: totalWeaponsCount,
      latestChange
    };
  }, []);

  // --------------------------------------------------
  // HANGAR ANALYZER CALCULATION
  // --------------------------------------------------
  const hangarAnalysis = useMemo(() => {
    const rolesList = ['Support', 'Tank-buster', 'Sniper', 'Midrange', 'Brawler', 'Beacon Runner', 'Assassin'];
    const scores = {};
    rolesList.forEach(r => {
      scores[r] = 0;
    });

    let selectedCount = 0;
    hangarRobots.forEach(robot => {
      if (robot) {
        selectedCount++;
        if (robot.roles) {
          robot.roles.forEach(roleObj => {
            const rName = roleObj.role;
            if (scores[rName] !== undefined) {
              if (roleObj.type === 'primary') {
                scores[rName] += 1.0;
              } else if (roleObj.type === 'secondary') {
                scores[rName] += 0.5;
              }
            }
          });
        }
      }
    });

    let grade = 'N/A';
    let gradeColor = 'var(--text-muted)';
    let gradeDesc = 'Awaiting selection...';

    if (selectedCount > 0) {
      const hasBrawler = scores['Brawler'] >= 0.5;
      const hasBeaconRunner = (scores['Beacon Runner'] + scores['Assassin']) >= 0.5;
      const hasSupport = scores['Support'] >= 0.5;
      const rangeCount = scores['Sniper'] + scores['Midrange'];
      const tooManySnipers = rangeCount > 2;

      let scorePoints = 0;
      if (hasBrawler) scorePoints += 2;
      if (hasBeaconRunner) scorePoints += 2;
      if (hasSupport) scorePoints += 1;
      if (!tooManySnipers) scorePoints += 1;
      scorePoints += Math.min(2, selectedCount * 0.4);

      if (scorePoints >= 5.5 && hasBrawler && hasBeaconRunner) {
        grade = 'S';
        gradeColor = '#fbbf24';
        gradeDesc = 'META SYNERGY - Extremely balanced hangar matching top competitive guidelines.';
      } else if (scorePoints >= 4.5 && (hasBrawler || hasBeaconRunner)) {
        grade = 'A';
        gradeColor = '#a855f7';
        gradeDesc = 'HIGH SYNERGY - Solid lineup covering major tactical roles. Great for general play.';
      } else if (scorePoints >= 3.0) {
        grade = 'B';
        gradeColor = '#3b82f6';
        gradeDesc = 'MODERATE SYNERGY - Decent setup but missing key frontline or runner elements.';
      } else if (scorePoints >= 1.5) {
        grade = 'C';
        gradeColor = '#0d9488';
        gradeDesc = 'LOW SYNERGY - Unbalanced layout. High risk of getting beacon-locked or overpowered.';
      } else {
        grade = 'D';
        gradeColor = '#f97316';
        gradeDesc = 'UNBALANCED - Heavy role deficits. Consider swapping for a broader mix of tactical roles.';
      }
    }

    return {
      scores,
      grade,
      gradeColor,
      gradeDesc,
      selectedCount
    };
  }, [hangarRobots]);


  // --------------------------------------------------
  // TIER LIST SEARCH & GROUPING
  // --------------------------------------------------
  const filteredTiers = useMemo(() => {
    if (!tiersData || !tiersData[selectedCategory]) return {};
    
    const categoryData = tiersData[selectedCategory];
    const result = {};
    
    Object.keys(categoryData).forEach(tierLetter => {
      const tierObj = categoryData[tierLetter];
      const filteredItems = tierObj.items.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
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

  // --------------------------------------------------
  // ROBOT GUIDE FILTERING
  // --------------------------------------------------
  const filteredRobots = useMemo(() => {
    if (!robotGuideData?.robots) return [];
    
    return robotGuideData.robots.filter(robot => {
      const matchSearch = robot.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          robot.comments.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchValue = robotValueFilter === 'All' || robot.value_rating === parseInt(robotValueFilter);
      
      const matchRole = robotRoleFilter === 'All' || 
                        robot.roles.some(r => r.role === robotRoleFilter && r.type !== 'none');
      
      return matchSearch && matchValue && matchRole;
    });
  }, [searchQuery, robotValueFilter, robotRoleFilter]);

  // --------------------------------------------------
  // TITAN GUIDE FILTERING
  // --------------------------------------------------
  const filteredTitans = useMemo(() => {
    if (!robotGuideData?.titans) return [];
    
    return robotGuideData.titans.filter(titan => {
      const matchSearch = titan.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          titan.comments.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchValue = robotValueFilter === 'All' || titan.value_rating === parseInt(robotValueFilter);
      
      return matchSearch && matchValue;
    });
  }, [searchQuery, robotValueFilter]);

  // --------------------------------------------------
  // MINI BUILDS FILTERING
  // --------------------------------------------------
  const filteredBuilds = useMemo(() => {
    if (!robotGuideData?.builds) return [];
    
    return robotGuideData.builds.filter(build => 
      build.build_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      build.robot.toLowerCase().includes(searchQuery.toLowerCase()) ||
      build.best_weapons.toLowerCase().includes(searchQuery.toLowerCase()) ||
      build.explanation.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  // --------------------------------------------------
  // WEAPONS CALC FILTERING & SORTING
  // --------------------------------------------------
  const filteredWeapons = useMemo(() => {
    if (!weaponsDpsData || !weaponsDpsData[selectedWeaponClass]) return [];
    
    return weaponsDpsData[selectedWeaponClass].filter(weapon => 
      weapon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      weapon.notes.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [selectedWeaponClass, searchQuery]);

  // --------------------------------------------------
  // COMPARISON CHART CALCULATIONS
  // --------------------------------------------------
  const maxDpsValues = useMemo(() => {
    if (compareList.length === 0) return { burst: 1, cycle: 1 };
    
    let maxBurst = 1;
    let maxCycle = 1;
    
    compareList.forEach(w => {
      const bDps = parseFloat(w.burst_dps) || 0;
      const cDps = parseFloat(w.cycle_dps) || 0;
      if (bDps > maxBurst) maxBurst = bDps;
      if (cDps > maxCycle) maxCycle = cDps;
    });
    
    return { burst: maxBurst, cycle: maxCycle };
  }, [compareList]);

  // --------------------------------------------------
  // WEAPON COMPARISON HANDLERS
  // --------------------------------------------------
  const toggleWeaponCompare = (weapon, className) => {
    const isSelected = compareList.some(w => w.name === weapon.name);
    
    if (isSelected) {
      setCompareList(compareList.filter(w => w.name !== weapon.name));
    } else {
      if (compareList.length >= 4) {
        alert("You can compare up to 4 weapons at a time.");
        return;
      }
      setCompareList([...compareList, { ...weapon, weaponClass: className }]);
    }
  };

  // Helper to check if weapon is selected
  const isWeaponCompareSelected = (weaponName) => {
    return compareList.some(w => w.name === weaponName);
  };

  // --------------------------------------------------
  // RATING STAR BUILDER
  // --------------------------------------------------
  const renderRatingStars = (rating) => {
    const stars = [];
    // rating is usually between -2 and 5. Let's draw it cleanly.
    // If rating is <= 0, we can display some custom symbol or tag, like a red shield.
    if (rating <= 0) {
      return <span className="role-badge secondary" style={{background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)'}}>Not Recommended ({rating})</span>;
    }
    
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star 
          key={i} 
          size={14} 
          fill={i < rating ? "currentColor" : "none"} 
          className={i < rating ? "text-amber-400" : "text-slate-600"} 
          style={{ color: i < rating ? "#fbbf24" : "#475569" }}
        />
      );
    }
    return <div className="value-rating-stars">{stars}</div>;
  };

  // --------------------------------------------------
  // SCORE METER RENDERER (-2 to 3 scale)
  // --------------------------------------------------
  const renderScoreMeter = (label, score) => {
    // Math to scale -2 to 3 onto 0% to 100%
    // Formula: (score - min) / (max - min) * 100
    // min = -2, max = 3. Range = 5.
    const scoreVal = parseInt(score) || 0;
    const percentage = Math.max(0, Math.min(100, ((scoreVal - (-2)) / 5) * 100));
    const isNegative = scoreVal < 0;
    
    return (
      <div className="score-bar-wrapper" key={label}>
        <div className="score-label">
          <span>{label}</span>
          <span style={{ fontWeight: 700, color: isNegative ? '#ef4444' : '#10b981' }}>
            {scoreVal > 0 ? `+${scoreVal}` : scoreVal}
          </span>
        </div>
        <div className="score-track">
          <div 
            className={`score-fill ${isNegative ? 'negative' : ''}`} 
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    );
  };

  // Helper to open details modal
  const openItemDetails = (name, type, data) => {
    setSelectedItem({ name, type, data });
  };

  return (
    <div className="app-container">
      {/* Sticky Header */}
      <header className="header">
        <div className="header-content">
          <a href="#" className="logo-container" onClick={() => setActiveTab('dashboard')}>
            <Shield size={24} className="logo-icon" />
            <span className="logo-text">r/WarRobotsGuide</span>
          </a>
          
          <nav className="nav-links">
            <button className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => { setActiveTab('dashboard'); setSearchQuery(''); }}>
              <Compass size={16} /> Home
            </button>
            <button className={`nav-item ${activeTab === 'tiers' ? 'active' : ''}`} onClick={() => { setActiveTab('tiers'); setSearchQuery(''); }}>
              <Award size={16} /> Tiers
            </button>
            <button className={`nav-item ${activeTab === 'robots' ? 'active' : ''}`} onClick={() => { setActiveTab('robots'); setSearchQuery(''); }}>
              <Shield size={16} /> Robots & Titans
            </button>
            <button className={`nav-item ${activeTab === 'builds' ? 'active' : ''}`} onClick={() => { setActiveTab('builds'); setSearchQuery(''); }}>
              <Sparkles size={16} /> Build Guides
            </button>
            <button className={`nav-item ${activeTab === 'specializations' ? 'active' : ''}`} onClick={() => { setActiveTab('specializations'); setSearchQuery(''); }}>
              <Layers size={16} /> Specializations
            </button>
            <button className={`nav-item ${activeTab === 'pilots' ? 'active' : ''}`} onClick={() => { setActiveTab('pilots'); setSearchQuery(''); }}>
              <UserCheck size={16} /> Pilot Skills
            </button>
            <button className={`nav-item ${activeTab === 'weapons' ? 'active' : ''}`} onClick={() => { setActiveTab('weapons'); setSearchQuery(''); }}>
              <BarChart2 size={16} /> Weapon DPS
            </button>
            <button className={`nav-item ${activeTab === 'hangar' ? 'active' : ''}`} onClick={() => { setActiveTab('hangar'); setSearchQuery(''); }}>
              <Zap size={16} /> Hangar Analyzer
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Pane */}
      <main className="main-content">
        
        {/* ========================================================================= */}
        {/* DASHBOARD (HOME) TAB */}
        {/* ========================================================================= */}
        {activeTab === 'dashboard' && (
          <div className="animate-fade-in">
            {/* Banner image and tagline */}
            <div className="hero-banner" style={{ padding: 0, overflow: 'hidden', position: 'relative' }}>
              <img 
                src="banner.jpg" 
                alt="War Robots Hangar Banner" 
                style={{ width: '100%', maxHeight: '420px', objectFit: 'cover', display: 'block', opacity: 0.85 }} 
              />
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, #07080d 5%, rgba(7, 8, 13, 0.4) 50%, rgba(7, 8, 13, 0.1) 100%)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                padding: '40px',
                textAlign: 'left'
              }}>
                <h1 style={{ fontSize: '42px', fontWeight: 800, margin: 0, textShadow: '0 4px 12px rgba(0,0,0,0.8)' }}>
                  Ultimate War Robots Database & Guides
                </h1>
                <p style={{ margin: '8px 0 0', maxWidth: '650px', fontSize: '15px', color: '#cbd5e1', textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>
                  Welcome to the database compiled by the expert community at <span style={{ color: 'var(--cyan)', fontWeight: 600 }}>r/WarRobotsGuide</span>. 
                  Get automated recommendations on weapon DPS, robot ratings, modules, pilots, and meta strategies.
                </p>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="dashboard-stats">
              <div className="glass-panel stat-card">
                <div className="stat-icon"><Shield size={24} /></div>
                <div>
                  <div className="stat-number">{stats.totalRobots + stats.totalTitans}</div>
                  <div className="stat-label">Robots & Titans evaluated</div>
                </div>
              </div>
              <div className="glass-panel stat-card">
                <div className="stat-icon"><BarChart2 size={24} /></div>
                <div>
                  <div className="stat-number">{stats.totalWeapons}</div>
                  <div className="stat-label">Weapons DPS parsed</div>
                </div>
              </div>
              <div className="glass-panel stat-card">
                <div className="stat-icon"><Sparkles size={24} /></div>
                <div>
                  <div className="stat-number">{stats.totalBuilds}</div>
                  <div className="stat-label">Mini hangar builds</div>
                </div>
              </div>
            </div>

            {/* Top Grid layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', textAlign: 'left' }} className="responsive-split">
              {/* Left Column: Featured Metas & Brief */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div className="glass-panel">
                  <h3 style={{ fontSize: '20px', marginBottom: '16px', display: 'flex', alignPage: 'center', gap: '8px' }}>
                    <Sparkles className="cyan-glow-text" size={20} /> Featured Meta Robots
                  </h3>
                  <div className="dashboard-grid">
                    {/* Show Pathfinder and Imugi (Value Rating 5) */}
                    {robotGuideData?.robots?.filter(r => r.value_rating === 5).map(robot => (
                      <div className="glass-panel glass-panel-hover" key={robot.name} style={{ background: 'rgba(255,255,255,0.01)', padding: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <h4 style={{ color: 'var(--cyan)' }}>{robot.name}</h4>
                          <span className="role-badge primary" style={{ background: 'rgba(251,191,36,0.1)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.2)' }}>
                            Value: {robot.value_rating}/5
                          </span>
                        </div>
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: 1.5 }}>
                          {robot.comments.slice(0, 160)}...
                        </p>
                        <button 
                          className="compare-action-btn" 
                          style={{ padding: '6px 12px', fontSize: '11px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid var(--border-light)' }}
                          onClick={() => setActiveTab('robots')}
                        >
                          View Detailed Scores
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-panel">
                  <h3 style={{ fontSize: '20px', marginBottom: '16px', display: 'flex', alignPage: 'center', gap: '8px' }}>
                    <BookOpen className="purple-glow-text" size={20} /> Quick Start Hangar Building Guide
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6, marginBottom: '16px' }}>
                    A balanced War Robots hangar typically consists of 5 robots and 1 titan. The subreddit guide recommends filling the following primary roles to ensure you can counter any opponent configuration:
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                      <span className="role-badge primary" style={{ display: 'inline-flex', marginBottom: '6px' }}>Support (x2)</span>
                      <p style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Augment teammates and lock down objectives.</p>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                      <span className="role-badge primary" style={{ display: 'inline-flex', marginBottom: '6px', background: 'rgba(59,130,246,0.1)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.2)' }}>Brawler / Tank</span>
                      <p style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Draw fire and absorb massive front-line damage.</p>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                      <span className="role-badge primary" style={{ display: 'inline-flex', marginBottom: '6px', background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)' }}>Beacon Runner</span>
                      <p style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Utilize stealth and dash speed to secure map nodes.</p>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                      <span className="role-badge primary" style={{ display: 'inline-flex', marginBottom: '6px', background: 'rgba(168,85,247,0.1)', color: '#a855f7', border: '1px solid rgba(168,85,247,0.2)' }}>Sniper / Midrange</span>
                      <p style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Provide cover fire and suppress high-threat targets.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Recent Changes Log */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div className="glass-panel" style={{ maxHeight: '550px', overflowY: 'auto' }}>
                  <h3 style={{ fontSize: '18px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', position: 'sticky', top: 0, background: 'rgba(15,18,30,0.9)', padding: '4px 0', zIndex: 10 }}>
                    <RefreshCw size={16} className="cyan-glow-text" /> Community Changelog
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {robotGuideData?.changelog?.slice(0, 10).map((log, index) => (
                      <div key={index} style={{ borderLeft: '2px solid var(--cyan)', paddingLeft: '12px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--cyan)', fontWeight: 600 }}>{log.date}</span>
                        <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
                          {log.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TIER LISTS TAB */}
        {/* ========================================================================= */}
        {activeTab === 'tiers' && (
          <div className="animate-fade-in text-left">
            <div className="hero-banner" style={{ padding: '24px', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '28px', marginBottom: '8px' }}>Community Tier List</h2>
              <p style={{ margin: '0 auto' }}>
                Explore community-compiled tier rankings for robots, titans, weapons, modules, and turrets. 
                Click any item to view the detailed explanation of its rank.
              </p>
            </div>

            {/* Category Select Tab Pills */}
            <div className="tab-pills">
              {['Robots', 'Titans', 'Drones', 'Motherships', 'Mothership Turrets', 'Robot Weapons', 'Titan Weapons'].map(cat => (
                <button 
                  key={cat} 
                  className={`tab-pill ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
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
                        {tierLetter === 'X' ? 'God' : tierLetter === 'S' ? 'Meta' : tierLetter === 'Z' ? 'Trash' : 'Tier'}
                      </span>
                    </div>
                    
                    <div className="tier-content">
                      <div style={{ gridColumn: '1 / -1', marginBottom: '4px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Community label:
                        </span>{' '}
                        <span style={{ fontSize: '13px', color: tierColor, fontWeight: 700 }}>
                          "{tierInfo.casual_name}"
                        </span>
                      </div>
                      
                      {tierInfo.items.map(item => (
                        <div 
                          className="tier-item-card" 
                          key={item.name}
                          onClick={() => openItemDetails(item.name, selectedCategory, item)}
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
          </div>
        )}

        {/* ========================================================================= */}
        {/* ROBOTS & TITANS DETAILED GUIDE TAB */}
        {/* ========================================================================= */}
        {activeTab === 'robots' && (
          <div className="animate-fade-in text-left">
            <div className="hero-banner" style={{ padding: '24px', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '28px', marginBottom: '8px' }}>Detailed Value Ratings & Scores</h2>
              <p style={{ margin: '0 auto' }}>
                Deep dive evaluations of Robots and Titans. Value rating represents F2P friendliness and return on investment. 
                Detailed scores range from <span style={{ color: '#ef4444' }}>-2 (Horrible)</span> to <span style={{ color: '#10b981' }}>+3 (Excellent)</span>.
              </p>
            </div>

            {/* Sub Tabs: Robots vs Titans */}
            <div className="tab-pills" style={{ maxWidth: '300px' }}>
              <button className={`tab-pill ${guideSubTab === 'robots' ? 'active' : ''}`} onClick={() => { setGuideSubTab('robots'); setRobotRoleFilter('All'); }}>
                Robots Guide
              </button>
              <button className={`tab-pill ${guideSubTab === 'titans' ? 'active' : ''}`} onClick={() => { setGuideSubTab('titans'); setRobotRoleFilter('All'); }}>
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
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Value rating filter */}
              <select 
                className="select-filter"
                value={robotValueFilter}
                onChange={(e) => setRobotValueFilter(e.target.value)}
              >
                <option value="All">All Value Ratings</option>
                <option value="5">Value 5/5 (Must Have)</option>
                <option value="4">Value 4/5 (Great)</option>
                <option value="3">Value 3/5 (Good)</option>
                <option value="2">Value 2/5 (Okay)</option>
                <option value="1">Value 1/5 (Bad)</option>
                <option value="0">Value 0/5 (Avoid)</option>
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
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '2px', fontWeight: 600 }}>VALUE RATING</span>
                        {renderRatingStars(robot.value_rating)}
                      </div>
                    </div>

                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '8px 0' }}>
                      {robot.comments}
                    </p>

                    {/* Scores bars */}
                    <div className="robot-scores">
                      {renderScoreMeter('Longevity', robot.scores.longevity)}
                      {renderScoreMeter('Lethality', robot.scores.lethality)}
                      {renderScoreMeter('Mobility', robot.scores.mobility)}
                      {renderScoreMeter('Utility', robot.scores.utility)}
                      {renderScoreMeter('Accessibility', robot.scores.accessibility)}
                      {renderScoreMeter('Overall Score', robot.scores.overall)}
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
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '2px', fontWeight: 600 }}>VALUE RATING</span>
                        {renderRatingStars(titan.value_rating)}
                      </div>
                    </div>

                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '8px 0' }}>
                      {titan.comments}
                    </p>

                    {/* Scores bars */}
                    <div className="robot-scores">
                      {renderScoreMeter('Longevity', titan.scores.longevity)}
                      {renderScoreMeter('Lethality', titan.scores.lethality)}
                      {renderScoreMeter('Mobility', titan.scores.mobility)}
                      {renderScoreMeter('Utility', titan.scores.utility)}
                      {renderScoreMeter('Accessibility', titan.scores.accessibility)}
                      {renderScoreMeter('Overall Score', titan.scores.overall)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* MINI BUILD GUIDES TAB */}
        {/* ========================================================================= */}
        {activeTab === 'builds' && (
          <div className="animate-fade-in text-left">
            <div className="hero-banner" style={{ padding: '24px', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '28px', marginBottom: '8px' }}>Optimized Robot Builds</h2>
              <p style={{ margin: '0 auto' }}>
                Hangar configurations recommendation including optimal f2p equipment, best modules specializations, pilots, and drones.
              </p>
            </div>

            {/* Search builds */}
            <div className="search-container">
              <div className="search-input-wrapper">
                <Search size={18} className="search-input-icon" />
                <input 
                  type="text" 
                  className="search-input" 
                  placeholder="Search builds by bot name, weapon, description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Builds Grid */}
            <div className="dashboard-grid">
              {filteredBuilds.map((build, index) => (
                <div className="glass-panel glass-panel-hover build-card" key={index}>
                  <div className="build-title-row">
                    <div>
                      <span className="spec-class-tag" style={{ background: 'rgba(6, 182, 212, 0.1)', color: 'var(--cyan)', borderColor: 'rgba(6, 182, 212, 0.2)', marginBottom: '4px', display: 'inline-block' }}>
                        {build.robot}
                      </span>
                      <h3 className="build-name">{build.build_name.replace('\n', ' ')}</h3>
                    </div>
                  </div>

                  <div className="build-meta-grid">
                    <div className="build-meta-item">
                      <span className="build-meta-label">Optimal Pilot</span>
                      <span className="build-meta-value">{build.pilot.replace('\n', ' ')}</span>
                    </div>
                    <div className="build-meta-item">
                      <span className="build-meta-label">Specialization Modules</span>
                      <span className="build-meta-value" style={{ fontSize: '11.5px', lineHeight: 1.4 }}>
                        {build.specialization.split('\n').map((line, lidx) => (
                          <div key={lidx}>{line}</div>
                        ))}
                      </span>
                    </div>
                    <div className="build-meta-item" style={{ gridColumn: 'span 2', borderTop: '1px solid var(--border-light)', paddingTop: '10px' }}>
                      <span className="build-meta-label">Weapons Setup</span>
                      <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                        <div style={{ flex: 1 }}>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>F2P SETUP</span>
                          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{build.f2p_weapons || 'N/A'}</p>
                        </div>
                        <div style={{ flex: 1, borderLeft: '1px solid var(--border-light)', paddingLeft: '10px' }}>
                          <span style={{ fontSize: '10px', color: '#fbbf24', fontWeight: 600 }}>BEST META SETUP</span>
                          <p style={{ fontSize: '12px', color: '#fbbf24' }}>{build.best_weapons || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="build-meta-item" style={{ gridColumn: 'span 2', borderTop: '1px solid var(--border-light)', paddingTop: '10px' }}>
                      <span className="build-meta-label">Drone Options</span>
                      <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                        <div style={{ flex: 1 }}>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>F2P DRONE</span>
                          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{build.f2p_drones || 'N/A'}</p>
                        </div>
                        <div style={{ flex: 1, borderLeft: '1px solid var(--border-light)', paddingLeft: '10px' }}>
                          <span style={{ fontSize: '10px', color: '#a855f7', fontWeight: 600 }}>BEST META DRONE</span>
                          <p style={{ fontSize: '12px', color: '#a855f7' }}>{build.best_drones || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="build-explanation">
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>TACTICAL EXPLANATION</span>
                    {build.explanation}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SPECIALIZATIONS TAB */}
        {/* ========================================================================= */}
        {activeTab === 'specializations' && (
          <div className="animate-fade-in text-left">
            <div className="hero-banner" style={{ padding: '24px', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '28px', marginBottom: '8px' }}>Module Specialization Guide</h2>
              <p style={{ margin: '0 auto' }}>
                Pick the right class specializations for your hangar. Upgrading modules is expensive; this guide helps you avoid account-bricking selections.
              </p>
            </div>

            {/* Intro text */}
            <div className="glass-panel" style={{ marginBottom: '24px', fontSize: '14px', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
              {specializationsData.intro.split('\n').map((para, pidx) => (
                <p key={pidx} style={{ marginBottom: para.startsWith('###') ? '12px' : '8px', marginTop: para.startsWith('###') ? '16px' : '0', fontWeight: para.startsWith('###') ? 700 : 400, color: para.startsWith('###') ? 'var(--cyan)' : 'inherit' }}>
                  {para.startsWith('###') ? para.replace('### ', '') : para}
                </p>
              ))}
            </div>

            {/* Specialization cards */}
            <div className="spec-grid">
              {specializationsData.sections.map((sec, sidx) => (
                <div className="glass-panel glass-panel-hover spec-card" key={sidx}>
                  <div className="spec-title-bar">
                    <span className="spec-class-tag" style={{
                      background: sec.title.includes('(Robot)') ? 'rgba(6, 182, 212, 0.1)' : 'rgba(168, 85, 247, 0.1)',
                      color: sec.title.includes('(Robot)') ? 'var(--cyan)' : 'var(--purple)',
                      borderColor: sec.title.includes('(Robot)') ? 'rgba(6, 182, 212, 0.2)' : 'rgba(168, 85, 247, 0.2)'
                    }}>
                      {sec.title.includes('(Robot)') ? 'Robot' : 'Titan'}
                    </span>
                    <h3 style={{ fontSize: '18px' }}>{sec.title.replace(' (Robot)', '').replace(' (Titan)', '')}</h3>
                  </div>

                  <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '12px' }}>
                    {sec.description}
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: 'auto' }}>
                    {sec.slots.map((slot, slidx) => (
                      <div className="spec-slot-box" key={slidx}>
                        <div className="spec-slot-title">
                          <Zap size={14} />
                          {slot.name}
                        </div>
                        <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                          {slot.content}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>


          </div>
        )}

        {/* ========================================================================= */}
        {/* PILOT SKILLS TAB */}
        {/* ========================================================================= */}
        {activeTab === 'pilots' && (
          <div className="animate-fade-in text-left">
            <div className="hero-banner" style={{ padding: '24px', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '28px', marginBottom: '8px' }}>Pilot Skills Directory</h2>
              <p style={{ margin: '0 auto' }}>
                Learn which pilot skills are essential (Must Use) vs trash (Don't Use) for Robot and Titan pilots.
              </p>
            </div>

            {/* Intro */}
            <div className="glass-panel" style={{ marginBottom: '24px', fontSize: '14px', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
              {pilotsData.intro}
            </div>

            {/* Sub Tabs: Robots vs Titans */}
            <div className="tab-pills" style={{ maxWidth: '300px' }}>
              <button className={`tab-pill ${pilotSubTab === 'robots' ? 'active' : ''}`} onClick={() => setPilotSubTab('robots')}>
                Robot Pilots
              </button>
              <button className={`tab-pill ${pilotSubTab === 'titans' ? 'active' : ''}`} onClick={() => setPilotSubTab('titans')}>
                Titan Pilots
              </button>
            </div>

            {/* Skills sections by category */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {['Must Use', 'Usually Use', 'Sometimes Use', "Don't Use"].map(cat => {
                const skills = pilotsData[pilotSubTab]?.[cat] || [];
                if (skills.length === 0) return null;
                
                // Colors based on category
                const catColor = cat === 'Must Use' ? '#10b981' : cat === 'Usually Use' ? '#3b82f6' : cat === 'Sometimes Use' ? '#f59e0b' : '#ef4444';
                const catBg = cat === 'Must Use' ? 'rgba(16, 185, 129, 0.05)' : cat === 'Usually Use' ? 'rgba(59, 130, 246, 0.05)' : cat === 'Sometimes Use' ? 'rgba(245, 158, 11, 0.05)' : 'rgba(239, 68, 68, 0.05)';
                const catBorder = cat === 'Must Use' ? 'rgba(16, 185, 129, 0.15)' : cat === 'Usually Use' ? 'rgba(59, 130, 246, 0.15)' : cat === 'Sometimes Use' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)';
                
                return (
                  <div className="glass-panel" key={cat} style={{ backgroundColor: catBg, borderColor: catBorder }}>
                    <h3 style={{ color: catColor, fontSize: '20px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {cat === "Don't Use" ? <XCircle size={20} /> : <CheckCircle2 size={20} />} {cat}
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {skills.map((skill, sidx) => (
                        <div key={sidx} style={{ background: 'rgba(0,0,0,0.15)', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                          <span style={{ fontWeight: 700, color: '#fff', fontSize: '14px', display: 'inline-block', marginBottom: '4px' }}>
                            {skill.name}
                          </span>
                          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                            {skill.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* WEAPONS DPS TAB */}
        {/* ========================================================================= */}
        {activeTab === 'weapons' && (
          <div className="animate-fade-in text-left">
            <div className="hero-banner" style={{ padding: '24px', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '28px', marginBottom: '8px' }}>Weapon DPS Calculator & Comparison</h2>
              <p style={{ margin: '0 auto' }}>
                Compare burst and cycle DPS metrics for all weapons. Select up to 4 weapons to generate an instant comparative bar chart.
              </p>
            </div>

            <div className="weapons-tab-container">
              {/* Compare Panel Bar */}
              {compareList.length > 0 && (
                <div className="weapon-comparison-bar animate-fade-in">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--cyan)', fontWeight: 600 }}>WEAPON COMPARISON ({compareList.length}/4)</span>
                    <div className="selected-weapons-list">
                      {compareList.map(w => (
                        <div className="selected-weapon-tag" key={w.name}>
                          <span>{w.name}</span>
                          <button className="remove-weapon-btn" onClick={() => toggleWeaponCompare(w, w.weaponClass)}>
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <button className="compare-action-btn" onClick={() => {
                    // Smooth scroll down to charts
                    document.getElementById('comparison-charts')?.scrollIntoView({ behavior: 'smooth' });
                  }}>
                    View Visual Chart Comparison
                  </button>
                </div>
              )}

              {/* Weapon Class Pills */}
              <div className="tab-pills">
                {['Heavy Weapons', 'Medium Weapons', 'Light Weapons', 'Alpha Weapons', 'Beta Weapons'].map(wclass => (
                  <button 
                    key={wclass} 
                    className={`tab-pill ${selectedWeaponClass === wclass ? 'active' : ''}`}
                    onClick={() => setSelectedWeaponClass(wclass)}
                  >
                    {wclass.replace(' Weapons', '')}
                  </button>
                ))}
              </div>

              {/* Search weapons */}
              <div className="search-container">
                <div className="search-input-wrapper">
                  <Search size={18} className="search-input-icon" />
                  <input 
                    type="text" 
                    className="search-input" 
                    placeholder={`Search ${selectedWeaponClass.toLowerCase()}...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Weapons Data Table */}
              <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="table-container">
                  <table className="weapons-table">
                    <thead>
                      <tr>
                        <th style={{ width: '40px', textAlign: 'center' }}>CMP</th>
                        <th>Weapon</th>
                        <th style={{ textAlign: 'right' }}>Burst DPS</th>
                        <th style={{ textAlign: 'right' }}>Cycle DPS</th>
                        <th>Range</th>
                        <th>Notes / Special Features</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredWeapons.map(weapon => {
                        const isSelected = isWeaponCompareSelected(weapon.name);
                        return (
                          <tr key={weapon.name} className={isSelected ? 'compare-selected' : ''}>
                            <td style={{ textAlign: 'center' }}>
                              <input 
                                type="checkbox" 
                                checked={isSelected}
                                onChange={() => toggleWeaponCompare(weapon, selectedWeaponClass)}
                                style={{ cursor: 'pointer', accentColor: 'var(--cyan)' }}
                              />
                            </td>
                            <td style={{ fontWeight: 600, color: '#fff' }}>{weapon.name}</td>
                            <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--cyan)' }}>
                              {parseFloat(weapon.burst_dps) ? parseFloat(weapon.burst_dps).toLocaleString() : weapon.burst_dps}
                            </td>
                            <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--purple)' }}>
                              {parseFloat(weapon.cycle_dps) ? parseFloat(weapon.cycle_dps).toLocaleString() : weapon.cycle_dps}
                            </td>
                            <td>
                              <span className="role-badge primary" style={{ display: 'inline-flex', padding: '2px 6px', background: 'rgba(255,255,255,0.03)', color: '#fff', border: '1px solid var(--border-light)' }}>
                                {weapon.range}
                              </span>
                            </td>
                            <td style={{ fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '400px' }}>
                              {weapon.notes}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Visual Comparisons Chart Section */}
              {compareList.length > 0 && (
                <div id="comparison-charts" className="glass-panel comparison-chart-container animate-fade-in" style={{ marginTop: '24px' }}>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BarChart2 size={20} className="cyan-glow-text" /> Weapon Statistics Visual Comparison
                  </h3>
                  
                  <div className="chart-legend">
                    <div className="legend-item">
                      <div className="legend-color-box" style={{ background: 'linear-gradient(90deg, var(--cyan), var(--indigo))' }}></div>
                      <span>Burst DPS (Short term damage unload)</span>
                    </div>
                    <div className="legend-item">
                      <div className="legend-color-box" style={{ background: 'linear-gradient(90deg, var(--purple), var(--indigo))' }}></div>
                      <span>Cycle DPS (Sustained damage output, includes reload)</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '12px' }}>
                    {compareList.map(weapon => {
                      const bDps = parseFloat(weapon.burst_dps) || 0;
                      const cDps = parseFloat(weapon.cycle_dps) || 0;
                      
                      const burstPercent = Math.max(5, (bDps / maxDpsValues.burst) * 100);
                      const cyclePercent = Math.max(5, (cDps / maxDpsValues.cycle) * 100);
                      
                      return (
                        <div className="chart-bar-row" key={weapon.name}>
                          <div className="chart-bar-info">
                            <span style={{ fontWeight: 700 }}>{weapon.name}</span>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Class: {weapon.weaponClass.replace(' Weapons', '')} | Range: {weapon.range}</span>
                          </div>
                          
                          <div className="chart-bar-tracks">
                            {/* Burst DPS Track */}
                            <div className="chart-track">
                              <div className="chart-track-fill" style={{ width: `${burstPercent}%` }}>
                                <span className="chart-value-label">
                                  Burst: {bDps > 0 ? bDps.toLocaleString() : weapon.burst_dps}
                                </span>
                              </div>
                            </div>
                            
                            {/* Cycle DPS Track */}
                            <div className="chart-track">
                              <div className="chart-track-fill cycle" style={{ width: `${cyclePercent}%` }}>
                                <span className="chart-value-label">
                                  Cycle: {cDps > 0 ? cDps.toLocaleString() : weapon.cycle_dps}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* HANGAR ANALYZER TAB */}
        {/* ========================================================================= */}
        {activeTab === 'hangar' && (
          <div className="animate-fade-in text-left">
            <div className="hero-banner" style={{ padding: '24px', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '28px', marginBottom: '8px' }}>Hangar Power Analyzer</h2>
              <p style={{ margin: '0 auto' }}>
                Evaluate your hangar composition, role coverage, and tactical synergy. A standard hangar consists of 5 robots and 1 titan.
              </p>
            </div>

            {/* Slots grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              {[0, 1, 2, 3, 4].map(idx => {
                const item = hangarRobots[idx];
                return item ? (
                  <div 
                    className="glass-panel glass-panel-hover" 
                    key={idx}
                    style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      padding: '16px', 
                      minHeight: '180px', 
                      borderRadius: '12px',
                      position: 'relative',
                      border: '1px solid var(--border-light)',
                      background: 'rgba(15, 18, 30, 0.45)'
                    }}
                  >
                    <button 
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        const newHangar = [...hangarRobots];
                        newHangar[idx] = null;
                        setHangarRobots(newHangar);
                      }}
                      title="Clear slot"
                    >
                      <X size={14} />
                    </button>

                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>
                      Robot Slot {idx + 1}
                    </span>

                    <h4 style={{ fontSize: '16px', color: 'var(--cyan)', margin: '0 0 6px 0', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', maxWidth: '140px' }} title={item.name}>
                      {item.name}
                    </h4>

                    <div style={{ display: 'flex', gap: '2px', marginBottom: '10px' }}>
                      {renderRatingStars(item.value_rating)}
                    </div>

                    {item.roles && item.roles.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: 'auto' }}>
                        {item.roles.map(r => (
                          <span 
                            key={r.role} 
                            className={`role-badge ${r.type}`} 
                            style={{ fontSize: '10px', padding: '1px 6px', display: 'inline-block', width: 'fit-content' }}
                          >
                            {r.role} {r.type === 'primary' ? '★' : '☆'}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 'auto' }}>No specific roles</span>
                    )}
                  </div>
                ) : (
                  <div 
                    className="glass-panel glass-panel-hover" 
                    key={idx}
                    style={{ 
                      border: '2px dashed var(--border-light)', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      padding: '24px', 
                      minHeight: '180px', 
                      cursor: 'pointer',
                      borderRadius: '12px',
                      transition: 'all 0.3s ease'
                    }}
                    onClick={() => { setActiveSlot(idx); setShowSelectorModal(true); }}
                  >
                    <div style={{ fontSize: '32px', color: 'var(--text-muted)', marginBottom: '8px' }}>+</div>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>ROBOT SLOT {idx + 1}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Click to select</span>
                  </div>
                );
              })}

              {/* Titan slot */}
              {hangarTitan ? (
                <div 
                  className="glass-panel glass-panel-hover" 
                  style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    padding: '16px', 
                    minHeight: '180px', 
                    borderRadius: '12px',
                    position: 'relative',
                    border: '1px solid rgba(168, 85, 247, 0.4)',
                    background: 'rgba(168, 85, 247, 0.05)'
                  }}
                >
                  <button 
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setHangarTitan(null);
                    }}
                    title="Clear slot"
                  >
                    <X size={14} />
                  </button>

                  <span style={{ fontSize: '11px', color: 'var(--purple)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>
                    Titan Slot
                  </span>

                  <h4 style={{ fontSize: '16px', color: 'var(--purple)', margin: '0 0 6px 0', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', maxWidth: '140px' }} title={hangarTitan.name}>
                    {hangarTitan.name}
                  </h4>

                  <div style={{ display: 'flex', gap: '2px', marginBottom: '10px' }}>
                    {renderRatingStars(hangarTitan.value_rating)}
                  </div>

                  <span style={{ fontSize: '11px', color: 'var(--purple)', marginTop: 'auto', fontWeight: 600 }}>Heavy Deployment option</span>
                </div>
              ) : (
                <div 
                  className="glass-panel glass-panel-hover" 
                  style={{ 
                    border: '2px dashed rgba(168, 85, 247, 0.4)', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    padding: '24px', 
                    minHeight: '180px', 
                    cursor: 'pointer',
                    borderRadius: '12px',
                    transition: 'all 0.3s ease',
                    background: 'rgba(168, 85, 247, 0.02)'
                  }}
                  onClick={() => { setActiveSlot(5); setShowSelectorModal(true); }}
                >
                  <div style={{ fontSize: '32px', color: 'var(--purple)', marginBottom: '8px' }}>+</div>
                  <span style={{ fontSize: '13px', color: 'var(--purple)', fontWeight: 700 }}>TITAN SLOT</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Click to select</span>
                </div>
              )}
            </div>

            {/* Analysis Dashboard */}
            {(hangarAnalysis.selectedCount > 0 || hangarTitan !== null) ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '32px', textAlign: 'left' }} className="responsive-split">
                
                {/* Left Panel: Role Strength Profiles */}
                <div className="glass-panel">
                  <h3 style={{ fontSize: '20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--cyan)' }}>
                    <BarChart2 size={20} /> Hangar Roles Profile
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {Object.keys(hangarAnalysis.scores).map(role => {
                      const score = hangarAnalysis.scores[role];
                      const percentage = Math.min(100, (score / 3.0) * 100);
                      const barColor = score >= 1.5 ? 'var(--cyan)' : score >= 0.5 ? '#3b82f6' : 'rgba(255,255,255,0.1)';
                      return (
                        <div key={role} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                            <span style={{ fontWeight: 600, color: score > 0 ? '#fff' : 'var(--text-muted)' }}>{role}</span>
                            <span style={{ 
                              fontWeight: 700, 
                              color: score >= 1.5 ? 'var(--cyan)' : score >= 0.5 ? '#3b82f6' : 'var(--text-muted)',
                              background: score > 0 ? 'rgba(255,255,255,0.05)' : 'none',
                              padding: '2px 8px',
                              borderRadius: '4px'
                            }}>
                              {score.toFixed(1)}
                            </span>
                          </div>
                          <div style={{ height: '8px', background: 'rgba(0,0,0,0.2)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ 
                              width: `${percentage}%`, 
                              height: '100%', 
                              background: barColor, 
                              borderRadius: '4px',
                              boxShadow: score > 0 ? `0 0 8px ${barColor}` : 'none',
                              transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                            }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right Panel: Synergy Evaluation & Advice */}
                <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <h3 style={{ fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--purple)' }}>
                    <Zap size={20} /> Tactical Synergy Rating
                  </h3>

                  {/* Grade Badge */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '16px', 
                    background: 'rgba(0,0,0,0.2)', 
                    padding: '16px', 
                    borderRadius: '12px',
                    border: `1px solid ${hangarAnalysis.gradeColor}40`
                  }}>
                    <div style={{ 
                      fontSize: '48px', 
                      fontWeight: 900, 
                      color: hangarAnalysis.gradeColor,
                      textShadow: `0 0 16px ${hangarAnalysis.gradeColor}`,
                      width: '72px',
                      height: '72px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: `${hangarAnalysis.gradeColor}10`,
                      borderRadius: '50%',
                      border: `3px solid ${hangarAnalysis.gradeColor}`,
                      flexShrink: 0
                    }}>
                      {hangarAnalysis.grade}
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', display: 'block' }}>HANGAR RATING</span>
                      <p style={{ margin: '4px 0 0 0', fontSize: '13.5px', color: '#fff', fontWeight: 600, lineHeight: 1.4 }}>
                        {hangarAnalysis.gradeDesc}
                      </p>
                    </div>
                  </div>

                  {/* Advice List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Tactical Feedback:</span>
                    
                    {/* Durability Advice */}
                    <div style={{ fontSize: '13.5px', lineHeight: 1.5 }}>
                      {hangarAnalysis.scores['Brawler'] >= 1.5 ? (
                        <span style={{ color: '#10b981' }}>✓ Strong Frontline: Multiple brawlers to push and hold beacon choke points.</span>
                      ) : hangarAnalysis.scores['Brawler'] >= 0.5 ? (
                        <span style={{ color: '#3b82f6' }}>✓ Frontline covered: Ready to contest center beacons.</span>
                      ) : (
                        <span style={{ color: '#f59e0b' }}>⚠️ Frontline vulnerability: Your hangar lacks dedicated Brawlers. Defending captured beacons will be tough.</span>
                      )}
                    </div>

                    {/* Mobility/Beacon Runner Advice */}
                    <div style={{ fontSize: '13.5px', lineHeight: 1.5 }}>
                      {(hangarAnalysis.scores['Beacon Runner'] + hangarAnalysis.scores['Assassin']) >= 1.5 ? (
                        <span style={{ color: '#10b981' }}>✓ High Mobility: Strong speed profile to secure early map control.</span>
                      ) : (hangarAnalysis.scores['Beacon Runner'] + hangarAnalysis.scores['Assassin']) >= 0.5 ? (
                        <span style={{ color: '#3b82f6' }}>✓ Beacon Runner covered: Essential for beacon matches.</span>
                      ) : (
                        <span style={{ color: '#f59e0b' }}>⚠️ Mobility deficit: No dedicated Beacon Runners. Capturing open beacons will be slow.</span>
                      )}
                    </div>

                    {/* Range Over-investment Advice */}
                    <div style={{ fontSize: '13.5px', lineHeight: 1.5 }}>
                      {(hangarAnalysis.scores['Sniper'] + hangarAnalysis.scores['Midrange']) > 2 ? (
                        <span style={{ color: '#ef4444' }}>⚠️ High Range Over-investment: More than 2 midrange/snipers leaves your frontline weak. Swap one for a brawler.</span>
                      ) : (hangarAnalysis.scores['Sniper'] + hangarAnalysis.scores['Midrange']) >= 0.5 ? (
                        <span style={{ color: '#3b82f6' }}>✓ Firepower suppression: Good capability to control lanes from distance.</span>
                      ) : (
                        <span style={{ color: 'var(--text-secondary)' }}>✓ Focused layout: No range weapons, optimized for active beacon brawling.</span>
                      )}
                    </div>

                    {/* Support Utility Advice */}
                    <div style={{ fontSize: '13.5px', lineHeight: 1.5 }}>
                      {hangarAnalysis.scores['Support'] >= 1.5 ? (
                        <span style={{ color: '#10b981' }}>✓ Tactical Utility: Strong teammate buffs, heals, and shield support.</span>
                      ) : hangarAnalysis.scores['Support'] >= 0.5 ? (
                        <span style={{ color: '#3b82f6' }}>✓ Support helper: Good utility to extend team lifespans.</span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>ℹ Solo focus: No support robots. You might miss out on extra honor points from healing teammates.</span>
                      )}
                    </div>

                    {/* Titan Advice */}
                    <div style={{ fontSize: '13.5px', lineHeight: 1.5, borderTop: '1px solid var(--border-light)', paddingTop: '12px', marginTop: '6px' }}>
                      {hangarTitan ? (
                        <span style={{ color: 'var(--purple)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Zap size={14} /> Titan {hangarTitan.name} ready: Provides a powerful late-game {hangarTitan.value_rating >= 4 ? 'top-tier option' : 'viable option'}.
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <XCircle size={14} /> Titan slot empty. Select a Titan to evaluate your late-game deployment.
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass-panel" style={{ padding: '40px', marginTop: '32px', color: 'var(--text-muted)', textAlign: 'center' }}>
                Select robots or a titan above to see your hangar's tactical roles profile and synergy rating.
              </div>
            )}
          </div>
        )}



      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-light)', padding: '24px', textAlign: 'center', marginTop: '48px', fontSize: '12px', color: 'var(--text-muted)' }}>
        <p>r/WarRobotsGuide Website. Compiled by Adazahi, Spiritings, Tropical, and Running Riot. Developed by CrimsonHawk.</p>
      </footer>

      {/* ========================================================================= */}
      {/* DETAILED INFORMATION MODAL */}
      {/* ========================================================================= */}
      {selectedItem && (
        <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
          <div className="modal-content text-left" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="spec-class-tag" style={{ background: 'rgba(6, 182, 212, 0.1)', color: 'var(--cyan)', borderColor: 'rgba(6, 182, 212, 0.2)', marginBottom: '4px', display: 'inline-block' }}>
                  {selectedItem.type}
                </span>
                <h3 style={{ fontSize: '22px' }}>{selectedItem.name}</h3>
              </div>
              <button className="modal-close-btn" onClick={() => setSelectedItem(null)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body">
              {/* Detailed Reasoning */}
              <div style={{ marginBottom: '20px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>
                  Community Critique & Reasoning:
                </span>
                <p style={{ color: 'var(--text-primary)', fontSize: '14.5px', lineHeight: 1.6 }}>
                  {selectedItem.data.description}
                </p>
              </div>

              {/* Extra context if available */}
              {/* For weapons */}
              {selectedItem.type.includes('Weapons') && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
                  {(() => {
                    // Try to search weapon in weapons_dps.json
                    let dpsInfo = null;
                    if (weaponsDpsData) {
                      Object.keys(weaponsDpsData).forEach(k => {
                        const found = weaponsDpsData[k].find(w => w.name.toLowerCase() === selectedItem.name.toLowerCase() || selectedItem.name.toLowerCase().includes(w.name.toLowerCase()));
                        if (found) dpsInfo = found;
                      });
                    }
                    if (dpsInfo) {
                      return (
                        <>
                          <div>
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>BURST DPS</span>
                            <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--cyan)' }}>{dpsInfo.burst_dps.toLocaleString()}</span>
                          </div>
                          <div>
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>CYCLE DPS</span>
                            <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--purple)' }}>{dpsInfo.cycle_dps.toLocaleString()}</span>
                          </div>
                          <div>
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>RANGE</span>
                            <span style={{ fontSize: '14px', fontWeight: 600 }}>{dpsInfo.range}</span>
                          </div>
                          {dpsInfo.notes && (
                            <div style={{ gridColumn: 'span 2', marginTop: '8px' }}>
                              <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>DPS CALC NOTES</span>
                              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{dpsInfo.notes}</p>
                            </div>
                          )}
                        </>
                      );
                    }
                    return null;
                  })()}
                </div>
              )}

              {/* For robots */}
              {selectedItem.type === 'Robots' && (
                <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
                  {(() => {
                    const rob = robotGuideData?.robots?.find(r => r.name.toLowerCase().trim() === selectedItem.name.toLowerCase().trim() || selectedItem.name.toLowerCase().includes(r.name.toLowerCase()));
                    if (rob) {
                      return (
                        <>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <div>
                              <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>VALUE RATING (F2P Return)</span>
                              {renderRatingStars(rob.value_rating)}
                            </div>
                            <div>
                              <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>RATED TIER SHEET</span>
                              <span className="role-badge primary" style={{ display: 'inline-flex', padding: '2px 8px' }}>{rob.sheet}</span>
                            </div>
                          </div>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>DETAILED ATTRIBUTE RATINGS (-2 to +3)</span>
                          <div className="robot-scores" style={{ border: 'none', padding: 0, margin: 0 }}>
                            {renderScoreMeter('Longevity', rob.scores.longevity)}
                            {renderScoreMeter('Lethality', rob.scores.lethality)}
                            {renderScoreMeter('Mobility', rob.scores.mobility)}
                            {renderScoreMeter('Utility', rob.scores.utility)}
                            {renderScoreMeter('Accessibility', rob.scores.accessibility)}
                            {renderScoreMeter('Overall Score', rob.scores.overall)}
                          </div>
                        </>
                      );
                    }
                    return null;
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* HANGAR SELECTOR OVERLAY MODAL */}
      {/* ========================================================================= */}
      {showSelectorModal && (
        <div className="modal-overlay" onClick={() => { setShowSelectorModal(false); setSelectorSearchQuery(''); }}>
          <div className="modal-content text-left" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '22px' }}>
                  {activeSlot === 5 ? 'Select Titan' : `Select Robot for Slot ${activeSlot + 1}`}
                </h3>
              </div>
              <button className="modal-close-btn" onClick={() => { setShowSelectorModal(false); setSelectorSearchQuery(''); }}>
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="search-input-wrapper">
                <Search size={18} className="search-input-icon" />
                <input 
                  type="text" 
                  className="search-input" 
                  placeholder={activeSlot === 5 ? "Search Titans..." : "Search Robots..."}
                  value={selectorSearchQuery}
                  onChange={(e) => setSelectorSearchQuery(e.target.value)}
                  autoFocus
                />
              </div>

              <div style={{ maxHeight: '350px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '4px' }}>
                {activeSlot === 5 ? (
                  // Titan selections
                  robotGuideData?.titans?.filter(t => t.name.toLowerCase().includes(selectorSearchQuery.toLowerCase())).map(titan => (
                    <div 
                      key={titan.name} 
                      className="glass-panel glass-panel-hover" 
                      style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', border: '1px solid var(--border-light)' }}
                      onClick={() => {
                        setHangarTitan(titan);
                        setShowSelectorModal(false);
                        setSelectorSearchQuery('');
                      }}
                    >
                      <div>
                        <span style={{ fontWeight: 700, color: '#fff' }}>{titan.name}</span>
                        <span style={{ fontSize: '11px', color: 'var(--purple)', marginLeft: '10px' }}>Titan</span>
                      </div>
                      <div style={{ display: 'flex', gap: '2px' }}>
                        {renderRatingStars(titan.value_rating)}
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
                      onClick={() => {
                        const newHangar = [...hangarRobots];
                        newHangar[activeSlot] = robot;
                        setHangarRobots(newHangar);
                        setShowSelectorModal(false);
                        setSelectorSearchQuery('');
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 700, color: '#fff' }}>{robot.name}</span>
                        <div style={{ display: 'flex', gap: '2px' }}>
                          {renderRatingStars(robot.value_rating)}
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
                
                {((activeSlot === 5 && !robotGuideData?.titans?.some(t => t.name.toLowerCase().includes(selectorSearchQuery.toLowerCase()))) ||
                  (activeSlot !== 5 && !robotGuideData?.robots?.some(r => r.name.toLowerCase().includes(selectorSearchQuery.toLowerCase())))) && (
                  <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No results found matching "{selectorSearchQuery}"
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
