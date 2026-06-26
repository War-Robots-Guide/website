import { useState, useMemo } from 'react';
import robotGuideData from '../../data/robot_guide.json';
import { SearchInput } from '../common/SearchInput';
import { BuildDetailModal } from './BuildDetailModal';

export function BuildGuidesTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBuild, setSelectedBuild] = useState(null);

  const filteredBuilds = useMemo(() => {
    if (!robotGuideData?.builds) return [];
    const query = searchQuery.toLowerCase().trim();
    
    let filtered = robotGuideData.builds.filter(build =>
      build.build_name.toLowerCase().includes(query) ||
      build.robot.toLowerCase().includes(query) ||
      build.best_weapons.toLowerCase().includes(query) ||
      build.explanation.toLowerCase().includes(query)
    );

    if (query) {
      // Prioritize robot name matches:
      // 1. Exact match on robot name
      // 2. Starts with robot name
      // 3. Substring match on robot name
      // 4. Other matches (non-robot)
      filtered = [...filtered].sort((a, b) => {
        const aRobot = a.robot.toLowerCase();
        const bRobot = b.robot.toLowerCase();
        
        const aExact = aRobot === query;
        const bExact = bRobot === query;
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        
        const aStarts = aRobot.startsWith(query);
        const bStarts = bRobot.startsWith(query);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        
        const aIncludes = aRobot.includes(query);
        const bIncludes = bRobot.includes(query);
        if (aIncludes && !bIncludes) return -1;
        if (!aIncludes && bIncludes) return 1;
        
        return 0;
      });
    }

    return filtered.map(build => ({
      ...build,
      parsed_build_name: build.build_name.replace(/\n/g, ' '),
      parsed_pilot: build.pilot.replace(/\n/g, ' '),
      parsed_specialization: build.specialization.split('\n')
    }));
  }, [searchQuery]);

  return (
    <div className="animate-fade-in text-left">
      <div className="hero-banner" style={{ padding: '24px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '28px', marginBottom: '8px' }}>Optimized Robot Builds</h2>
        <p style={{ margin: '0 auto' }}>
          Learn the best weapon, specialization, pilot, and drone configurations for your robots.
          <span style={{ display: 'block', marginTop: '8px', fontSize: '13px', color: 'var(--text-secondary)', opacity: 0.85 }}>
            <em>Note: Build guides are only provided for recommended robots.</em>
          </span>
        </p>
      </div>

      {/* Search builds */}
      <div className="search-container">
        <SearchInput
          placeholder="Search builds by bot name, weapon, description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Builds Grid */}
      <div className="dashboard-grid">
        {filteredBuilds.map((build, index) => (
          <div 
            className="glass-panel glass-panel-hover build-card" 
            key={`${build.robot}-${build.build_name}-${index}`}
            onClick={() => setSelectedBuild(build)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedBuild(build); } }}
            tabIndex={0}
            role="button"
            aria-label={`View details for build ${build.parsed_build_name} on ${build.robot}`}
          >
            <div className="build-title-row">
              <div>
                <span className="spec-class-tag" style={{ background: 'rgba(6, 182, 212, 0.1)', color: 'var(--cyan)', borderColor: 'rgba(6, 182, 212, 0.2)', marginBottom: '4px', display: 'inline-block' }}>
                  {build.robot}
                </span>
                <h3 className="build-name">{build.parsed_build_name}</h3>
              </div>
            </div>

            <div className="build-meta-grid">
              <div className="build-meta-item">
                <span className="build-meta-label">Pilot options</span>
                <span className="build-meta-value">{build.parsed_pilot}</span>
              </div>
              <div className="build-meta-item">
                <span className="build-meta-label">specializations & modules</span>
                <span className="build-meta-value" style={{ fontSize: '11.5px', lineHeight: 1.4 }}>
                  {build.parsed_specialization.map((line, lidx) => (
                    <div key={lidx}>{line}</div>
                  ))}
                </span>
              </div>
              <div className="build-meta-item" style={{ gridColumn: 'span 2', borderTop: '1px solid var(--border-light)', paddingTop: '10px' }}>
                <span className="build-meta-label">Weapon Options</span>
                <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>F2P SETUPS</span>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{build.f2p_weapons || 'N/A'}</p>
                  </div>
                  <div style={{ flex: 1, borderLeft: '1px solid var(--border-light)', paddingLeft: '10px' }}>
                    <span style={{ fontSize: '10px', color: '#fbbf24', fontWeight: 600 }}>META SETUPS</span>
                    <p style={{ fontSize: '12px', color: '#fbbf24' }}>{build.best_weapons || 'N/A'}</p>
                  </div>
                </div>
              </div>
              <div className="build-meta-item" style={{ gridColumn: 'span 2', borderTop: '1px solid var(--border-light)', paddingTop: '10px' }}>
                <span className="build-meta-label">Drone Options</span>
                <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>F2P DRONES</span>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{build.f2p_drones || 'N/A'}</p>
                  </div>
                  <div style={{ flex: 1, borderLeft: '1px solid var(--border-light)', paddingLeft: '10px' }}>
                    <span style={{ fontSize: '10px', color: '#fbbf24', fontWeight: 600 }}>META DRONES</span>
                    <p style={{ fontSize: '12px', color: '#fbbf24' }}>{build.best_drones || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="build-explanation">
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>EXPLANATION</span>
              {build.explanation}
            </div>
          </div>
        ))}
      </div>

      {selectedBuild && (
        <BuildDetailModal build={selectedBuild} onClose={() => setSelectedBuild(null)} />
      )}
    </div>
  );
}
