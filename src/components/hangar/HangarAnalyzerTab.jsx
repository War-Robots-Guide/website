import { useState, useMemo } from 'react';
import { HangarSelectorModal } from './HangarSelectorModal';
import { getTierForName } from '../../utils/tierLookup';
import { RobotSlot } from './RobotSlot';
import { TitanSlot } from './TitanSlot';
import { AnalysisDashboard } from './AnalysisDashboard';
import {
  TIER_VALUES,
  REVERSE_TIER_VALUES,
  STATUS_COLORS,
  CORE_ROLES_CONFIG,
  TOTAL_CORE_TARGETS,
  SUPPORT_TARGET,
  TANK_BUSTER_TARGET
} from './constants';

export function HangarAnalyzerTab() {
  const [hangarRobots, setHangarRobots] = useState([null, null, null, null, null]);
  const [hangarTitan, setHangarTitan] = useState(null);
  const [activeSlot, setActiveSlot] = useState(null); // null, or 0-4 for robots, 5 for titan
  const [showSelectorModal, setShowSelectorModal] = useState(false);
  const [selectorSearchQuery, setSelectorSearchQuery] = useState('');

  const hangarAnalysis = useMemo(() => {
    const rolesList = ['Support', 'Tank-buster', 'Sniper', 'Midrange', 'Brawler', 'Beacon Runner', 'Assassin', 'Early Drop', 'Late Drop'];
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

    // Parse hangarTitan roles if selected
    if (hangarTitan && hangarTitan.roles) {
      hangarTitan.roles.forEach(roleObj => {
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

    const coreMetCount = CORE_ROLES_CONFIG.reduce((sum, role) => {
      const score = scores[role.key] || 0;
      return sum + Math.min(role.target, score);
    }, 0);
    const corePercent = Math.round((coreMetCount / TOTAL_CORE_TARGETS) * 100);
    
    let alignmentColor = STATUS_COLORS.MISSING.color;
    if (corePercent >= 100) alignmentColor = STATUS_COLORS.MET.color;
    else if (corePercent >= 50) alignmentColor = STATUS_COLORS.UNDERFILLED.color;

    return {
      scores,
      selectedCount,
      coreMetCount,
      corePercent,
      alignmentColor
    };
  }, [hangarRobots, hangarTitan]);

  const averageTier = useMemo(() => {
    let sum = 0;
    let count = 0;
    
    hangarRobots.forEach(robot => {
      if (robot) {
        const tier = getTierForName(robot.name, 'Robots');
        if (tier && TIER_VALUES[tier] !== undefined) {
          sum += TIER_VALUES[tier];
          count++;
        }
      }
    });
    
    if (hangarTitan) {
      const tier = getTierForName(hangarTitan.name, 'Titans');
      if (tier && TIER_VALUES[tier] !== undefined) {
        sum += TIER_VALUES[tier];
        count++;
      }
    }
    
    if (count === 0) return 'N/A';
    const avg = Math.round(sum / count);
    return REVERSE_TIER_VALUES[avg] || 'N/A';
  }, [hangarRobots, hangarTitan]);

  const handleOpenSelector = (slotIndex) => {
    setActiveSlot(slotIndex);
    setShowSelectorModal(true);
  };

  const handleCloseSelector = () => {
    setShowSelectorModal(false);
    setSelectorSearchQuery('');
  };

  const handleSelectUnit = (unit) => {
    if (activeSlot === 5) {
      setHangarTitan(unit);
    } else {
      const newHangar = [...hangarRobots];
      newHangar[activeSlot] = unit;
      setHangarRobots(newHangar);
    }
    handleCloseSelector();
  };

  const handleClearSlot = (slotIndex, e) => {
    e.stopPropagation();
    if (slotIndex === 5) {
      setHangarTitan(null);
    } else {
      const newHangar = [...hangarRobots];
      newHangar[slotIndex] = null;
      setHangarRobots(newHangar);
    }
  };

  return (
    <div className="animate-fade-in text-left">
      <div className="hero-banner" style={{ padding: '24px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '28px', marginBottom: '8px' }}>Hangar Analyzer</h2>
        <p style={{ margin: '0 auto' }}>
          Get a general idea of how strong your hangar is.
        </p>
      </div>

      {/* Slots grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {[0, 1, 2, 3, 4].map(idx => (
          <RobotSlot
            key={idx}
            item={hangarRobots[idx]}
            index={idx}
            onOpenSelector={handleOpenSelector}
            onClearSlot={handleClearSlot}
          />
        ))}

        {/* Titan slot */}
        <TitanSlot
          item={hangarTitan}
          onOpenSelector={handleOpenSelector}
          onClearSlot={handleClearSlot}
        />
      </div>

      {/* Analysis Dashboard */}
      {(hangarAnalysis.selectedCount > 0 || hangarTitan !== null) ? (
        <AnalysisDashboard
          hangarAnalysis={hangarAnalysis}
          averageTier={averageTier}
          CORE_ROLES_CONFIG={CORE_ROLES_CONFIG}
          STATUS_COLORS={STATUS_COLORS}
          SUPPORT_TARGET={SUPPORT_TARGET}
          TANK_BUSTER_TARGET={TANK_BUSTER_TARGET}
        />
      ) : (
        <div className="glass-panel" style={{ padding: '40px', marginTop: '32px', color: 'var(--text-muted)', textAlign: 'center' }}>
          Fill out the hangar analyzer above for automated feedback.
        </div>
      )}

      {/* Selector Modal Overlay */}
      {showSelectorModal && (
        <HangarSelectorModal
          activeSlot={activeSlot}
          selectorSearchQuery={selectorSearchQuery}
          setSelectorSearchQuery={setSelectorSearchQuery}
          onClose={handleCloseSelector}
          onSelect={handleSelectUnit}
        />
      )}
    </div>
  );
}
