import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import robotGuideData from '../../data/robot_guide.json';

export function BuildGuidesTab() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBuilds = useMemo(() => {
    if (!robotGuideData?.builds) return [];
    const query = searchQuery.toLowerCase();
    
    return robotGuideData.builds.filter(build => 
      build.build_name.toLowerCase().includes(query) ||
      build.robot.toLowerCase().includes(query) ||
      build.best_weapons.toLowerCase().includes(query) ||
      build.explanation.toLowerCase().includes(query)
    );
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
          <div className="glass-panel glass-panel-hover build-card" key={build.build_name || index}>
            <div className="build-title-row">
              <div>
                <span className="spec-class-tag" style={{ background: 'rgba(6, 182, 212, 0.1)', color: 'var(--cyan)', borderColor: 'rgba(6, 182, 212, 0.2)', marginBottom: '4px', display: 'inline-block' }}>
                  {build.robot}
                </span>
                <h3 className="build-name">{build.build_name.replace(/\n/g, ' ')}</h3>
              </div>
            </div>

            <div className="build-meta-grid">
              <div className="build-meta-item">
                <span className="build-meta-label">Optimal Pilot</span>
                <span className="build-meta-value">{build.pilot.replace(/\n/g, ' ')}</span>
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
                    <span style={{ fontSize: '10px', color: '#fbbf24', fontWeight: 600 }}>BEST META SETUPS</span>
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
                    <span style={{ fontSize: '10px', color: '#a855f7', fontWeight: 600 }}>BEST META DRONES</span>
                    <p style={{ fontSize: '12px', color: '#a855f7' }}>{build.best_drones || 'N/A'}</p>
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
    </div>
  );
}
