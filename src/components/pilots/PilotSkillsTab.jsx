import { PageHero } from '../common/PageHero';
import { useState } from 'react';
import pilotsData from '../../data/pilots.json';

import { SlidingTabPills } from '../common/SlidingTabPills';

function PilotSkillCategory({ cat, skills }) {
  const getCategoryIcon = (cat) => {
    const iconName = cat === 'Must Use'
      ? 'pilot_green.png'
      : cat === 'Usually Use'
      ? 'pilot_blue.png'
      : cat === 'Sometimes Use'
      ? 'pilot_yellow.png'
      : 'pilot_red.png';

    return (
      <img 
        src={`/icons/${iconName}`} 
        alt="" 
        className="icon-26"
      />
    );
  };

  const catColor = cat === 'Must Use' ? '#10b981' : cat === 'Usually Use' ? '#3b82f6' : cat === 'Sometimes Use' ? '#f59e0b' : '#ef4444';
  const catBg = cat === 'Must Use' ? 'rgba(16, 185, 129, 0.05)' : cat === 'Usually Use' ? 'rgba(59, 130, 246, 0.05)' : cat === 'Sometimes Use' ? 'rgba(245, 158, 11, 0.05)' : 'rgba(239, 68, 68, 0.05)';
  const catBorder = cat === 'Must Use' ? 'rgba(16, 185, 129, 0.15)' : cat === 'Usually Use' ? 'rgba(59, 130, 246, 0.15)' : cat === 'Sometimes Use' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)';

  return (
    <div className="glass-panel" style={{ backgroundColor: catBg, borderColor: catBorder }}>
      <h3 style={{ color: catColor, fontSize: '20px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        {getCategoryIcon(cat)} {cat}
      </h3>
      <div className="stack-12">
        {skills.map((skill, sidx) => (
          <div key={skill.name || sidx} style={{ background: 'rgba(0,0,0,0.15)', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
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
}

export function PilotSkillsTab() {
  const [pilotSubTab, setPilotSubTab] = useState('robots');

  return (
    <div className="animate-fade-in text-left">
      <PageHero title="Pilot Skills Directory">
        Learn what pilot skills are the strongest and which skills should be avoided.
      </PageHero>

      {/* Sub Tabs: Robots vs Titans */}
      <SlidingTabPills
        tabs={[
          { label: 'Robot Pilots', value: 'robots' },
          { label: 'Titan Pilots', value: 'titans' }
        ]}
        activeTab={pilotSubTab}
        onChange={setPilotSubTab}
      />

      {/* Skills sections by category */}
      <div className="stack-20">
        {['Must Use', 'Usually Use', 'Sometimes Use', "Don't Use"].map(cat => {
          const skills = pilotsData[pilotSubTab]?.[cat] || [];
          if (skills.length === 0) return null;
          
          return <PilotSkillCategory key={cat} cat={cat} skills={skills} />;
        })}
      </div>
    </div>
  );
}
