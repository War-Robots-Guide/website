import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import robotGuideData from '../../data/robot_guide.json';
import { sortBySearchQuery } from '../../utils/sortUtils';
import { getTierForName } from '../../utils/tierLookup';
import { getRobotImage, cleanKey } from '../../utils/imageUtils';
import { RatingBar } from '../common/RatingBar';
import { SearchInput } from '../common/SearchInput';
import { BuildDetailModal } from './BuildDetailModal';

// Precompute static data at module level to optimize render loop
const precomputedBuilds = (robotGuideData?.builds || []).map(build => {
  const is_ultimate = Boolean(
    build.is_ultimate ||
    build.build_name?.toLowerCase() === 'ultimate' ||
    build.robot?.toLowerCase().startsWith('ue ')
  );
  return {
    ...build,
    is_ultimate,
    _searchString: `${build.build_name} ${build.robot} ${build.best_weapons} ${build.drone_options || ''} ${build.explanation}`.toLowerCase(),
    parsed_build_name: build.build_name.replace(/\n/g, ' '),
    parsed_pilot: build.pilot.replace(/\n/g, ' '),
    parsed_specialization: build.specialization.split('\n')
  };
});

export function BuildGuidesTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBuild, setSelectedBuild] = useState(null);

  // Lazy loading state
  const [visibleCount, setVisibleCount] = useState(12);
  const [prevSearchQuery, setPrevSearchQuery] = useState(searchQuery);

  if (searchQuery !== prevSearchQuery) {
    setPrevSearchQuery(searchQuery);
    setVisibleCount(12);
  }

  // Pre-calculate robot value ratings for fast display on build cards
  const robotValueMap = useMemo(() => {
    const map = {};
    if (robotGuideData?.robots) {
      robotGuideData.robots.forEach(r => {
        map[cleanKey(r.name)] = r.value_rating;
      });
    }
    if (robotGuideData?.titans) {
      robotGuideData.titans.forEach(t => {
        map[cleanKey(t.name)] = t.value_rating;
      });
    }
    return map;
  }, []);

  const filteredBuilds = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) {
      return precomputedBuilds;
    }

    let filtered = precomputedBuilds.filter(build => build._searchString.includes(query));

    return sortBySearchQuery(filtered, query, (build) => build.robot);
  }, [searchQuery]);

  // Paginated visible items list
  const visibleBuilds = useMemo(() => {
    return filteredBuilds.slice(0, visibleCount);
  }, [filteredBuilds, visibleCount]);

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
        <h2 style={{ fontSize: '28px', marginBottom: '8px' }}>Robot Build Guides</h2>
        <p style={{ margin: '0 auto' }}>
          Explore optimal weapons, specializations, pilots, and drones for top robots. Click any build to view detailed visual setups.
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
        {visibleBuilds.map((build, index) => {
          const tier = getTierForName(build.robot, 'Robots');
          const imageUrl = getRobotImage(build.robot);
          const valueRating = robotValueMap[cleanKey(build.robot)] ?? 0;
          const tierKey = tier ? tier.toLowerCase() : 'z';

          return (
            <div 
              className={`glass-panel glass-panel-hover build-card ${build.is_ultimate ? 'ultimate-build-card' : ''}`}
              style={{
                position: 'relative',
                height: '240px',
                borderRadius: '14px',
                overflow: 'hidden',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '16px',
                border: build.is_ultimate ? '1px solid rgba(234, 179, 8, 0.35)' : '1px solid var(--border-light)',
                background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.6) 0%, rgba(10, 14, 23, 0.95) 100%)',
              }}
              key={`${build.robot}-${build.build_name}-${index}`}
              onClick={() => setSelectedBuild(build)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedBuild(build);
                }
              }}
              tabIndex={0}
              role="button"
              aria-label={`View details for build ${build.parsed_build_name} on ${build.robot}`}
            >
              {/* Background Robot Image */}
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={build.robot}
                  loading="lazy"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center 25%',
                    zIndex: 0,
                    transition: 'transform 0.3s ease',
                  }}
                  className="robot-card-bg-img"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : null}

              {/* Scrim Overlay */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(180deg, rgba(10, 14, 23, 0.8) 0%, rgba(10, 14, 23, 0.2) 45%, rgba(10, 14, 23, 0.92) 100%)',
                  zIndex: 1,
                  pointerEvents: 'none',
                }}
              />

              {/* Top Header: Inverted Hierarchy - Robot Name is the prominent name, Build name is the tag, RatingBar in top right */}
              <div
                style={{
                  position: 'relative',
                  zIndex: 2,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '12px',
                  width: '100%',
                }}
              >
                <div>
                  {/* Robot Name (Prominent Header) */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
                    <h3
                      className="spec-class-tag"
                      style={{
                        margin: 0,
                        fontSize: '20px',
                        fontWeight: 800,
                        color: build.is_ultimate ? '#fef08a' : '#fff',
                        textShadow: '0 2px 4px rgba(0,0,0,0.8)',
                        background: 'none',
                        border: 'none',
                        padding: 0,
                      }}
                    >
                      {build.robot}
                    </h3>

                    {tier && (
                      <span
                        className={`tier-badge-${tierKey}`}
                        style={{
                          fontSize: '10px',
                          fontWeight: 800,
                          padding: '2px 7px',
                          borderRadius: '4px',
                          background: `var(--tier-${tierKey}-bg)`,
                          color: `var(--tier-${tierKey})`,
                          border: `1px solid var(--tier-${tierKey}-border)`,
                          textTransform: 'uppercase',
                          lineHeight: 1,
                        }}
                      >
                        {tier} Tier
                      </span>
                    )}

                    {build.is_ultimate && (
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 800,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: 'rgba(234, 179, 8, 0.2)',
                          color: '#fbbf24',
                          border: '1px solid rgba(234, 179, 8, 0.4)',
                          textTransform: 'uppercase',
                          lineHeight: 1,
                        }}
                      >
                        Ultimate
                      </span>
                    )}
                  </div>

                  {/* Build Name (Styled like a subtitle tag) */}
                  <span
                    className="build-name-tag"
                    style={{
                      fontSize: '11.5px',
                      fontWeight: 600,
                      color: 'var(--cyan)',
                      background: 'rgba(6, 182, 212, 0.15)',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      border: '1px solid rgba(6, 182, 212, 0.3)',
                      display: 'inline-block',
                    }}
                  >
                    {build.parsed_build_name}
                  </span>
                </div>

                {/* Top Right: Value Rating Bar without big box */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0 }}>
                  <span style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>
                    VALUE RATING
                  </span>
                  <RatingBar rating={valueRating} unitType="robot" align="right" />
                </div>
              </div>

              {/* Screen reader content for testing and accessibility */}
              <div className="sr-only">
                <span>{build.parsed_pilot}</span>
                <span style={{ whiteSpace: 'pre-line' }}>{build.best_weapons}</span>
                <span style={{ whiteSpace: 'pre-line' }}>{build.f2p_weapons}</span>
                <span>{build.explanation}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sentinel for infinite scroll */}
      {visibleBuilds.length < filteredBuilds.length && (
        <div ref={sentinelRef} style={{ height: '40px', margin: '20px 0' }} />
      )}

      {/* UE Weapon Index Reference Legend */}
      {robotGuideData?.ue_weapon_index && Object.keys(robotGuideData.ue_weapon_index).length > 0 && (
        <div className="glass-panel" style={{ marginTop: '28px', padding: '18px 22px' }}>
          <h4 style={{ fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 600, letterSpacing: '0.05em' }}>
            UE (Ultimate Edition) Weapon Index
          </h4>
          <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: '0 0 14px 0', lineHeight: 1.4 }}>
            When build guides specify <em>&quot;UE Setups&quot;</em>, <em>&quot;Midrange UE setups&quot;</em>, or <em>&quot;Close range UE setups&quot;</em>, refer to these weapon categories:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
            {Object.entries(robotGuideData.ue_weapon_index).map(([category, weapons]) => (
              <div key={category} style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                <strong style={{ color: '#fbbf24', fontSize: '12.5px', display: 'block', marginBottom: '3px' }}>
                  {category} Setups
                </strong>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  {weapons}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Build Detail Modal */}
      {selectedBuild && (
        <BuildDetailModal
          build={selectedBuild}
          onClose={() => setSelectedBuild(null)}
        />
      )}
    </div>
  );
}
