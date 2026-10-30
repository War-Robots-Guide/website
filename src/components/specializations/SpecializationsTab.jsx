import { resolveModuleName } from '../../utils/moduleCatalog';
import { getSpecializationSlots } from './recommendations';
import { ModuleList } from '../common/ModuleList';
import { PageHero } from '../common/PageHero';
import { useState, useMemo } from 'react';
import specializationsData from '../../data/specializations.json';
import { specTree } from './specTree';
import { SlidingTabPills } from '../common/SlidingTabPills';

export function SpecializationsTab({ onItemClick }) {
  const [activeSubTab, setActiveSubTab] = useState('picker');
  const [specPath, setSpecPath] = useState([]);

  // Derive current step state in specTree
  const currentSpecNode = useMemo(() => {
    let node = specTree;
    for (const step of specPath) {
      const option = node.options?.find(opt => opt.value === step.value);
      if (option) {
        if (option.next) {
          node = option.next;
        } else if (option.result) {
          node = option; // Leaf result node
        }
      }
    }
    return node;
  }, [specPath]);

  return (
    <div className="animate-fade-in text-left">
      <PageHero title="Specializations Guide">
        Find optimal module specializations and synergies for your robots and titans.
      </PageHero>

      {/* View Switcher Pills */}
      <SlidingTabPills
        tabs={[
          { label: 'Specialization Picker', value: 'picker' },
          { label: 'More Details', value: 'details' }
        ]}
        activeTab={activeSubTab}
        onChange={setActiveSubTab}
      />

      {/* 1. Main View: Interactive Specialization Picker */}
      {activeSubTab === 'picker' && (
        <div className="spec-finder-container animate-fade-in" style={{ marginBottom: '24px', marginTop: '20px' }}>
          <div className="spec-finder-content">
            <div className="spec-finder-header">
              <img src="/icons/ms_turret.png" alt="" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, fontFamily: 'var(--heading)' }}>
                  Automatic Specialization Picker
                </h3>
                <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                  Step-by-step guidance to find the optimal modules and specialization track.
                </p>
              </div>
            </div>

            {/* Breadcrumbs */}
            <div className="spec-finder-breadcrumbs" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              <button 
                style={{ background: 'none', border: 'none', padding: 0, color: 'var(--text-secondary)', cursor: 'pointer', textDecoration: specPath.length > 0 ? 'underline' : 'none' }} 
                onClick={() => setSpecPath([])}
              >
                Start
              </button>
              {specPath.map((step, idx) => (
                <span key={idx} className="row-center-8">
                  <span style={{ color: 'var(--text-muted)' }}>&gt;</span>
                  <button 
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      padding: 0, 
                      cursor: 'pointer', 
                      textDecoration: idx < specPath.length - 1 ? 'underline' : 'none',
                      color: idx === specPath.length - 1 ? (specPath[0]?.value === 'titan' ? 'var(--purple)' : 'var(--cyan)') : 'inherit',
                      fontWeight: idx === specPath.length - 1 ? '600' : 'normal'
                    }} 
                    onClick={() => setSpecPath(specPath.slice(0, idx + 1))}
                  >
                    {step.label}
                  </button>
                </span>
              ))}
            </div>

            {currentSpecNode.result ? (
              /* Render Result with Module Images */
              <div className={`spec-finder-result ${specPath[0]?.value === 'titan' ? 'titan-result' : ''}`}>
                <div className={`spec-result-title ${specPath[0]?.value === 'titan' ? 'titan-result' : ''}`}>
                  <img src="/icons/role_sniper_top.png" alt="" className="icon-26" />
                  Recommended Specialization: {currentSpecNode.result.specialization}
                </div>
                <div className="spec-result-path">
                  Path: {specPath.map(s => s.label).join(' ➔ ')}
                </div>
                
                <div className="spec-result-slots" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                  {currentSpecNode.result.slots.map((slot, index) => {
                    const isTitan = specPath[0]?.value === 'titan';
                    const modules = slot.modules || [resolveModuleName(slot.name.replace(/^Slot \d+:\s*/i, ''), isTitan)];
                    return <div className="spec-result-slot-box" key={index}>
                      <h4>Slot {index + 1}</h4>
                      <ModuleList modules={modules} />
                    </div>;
                  })}
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                  <button className="spec-reset-btn" onClick={() => setSpecPath([])}>
                    <img src="/icons/time_gold.png" alt="" className="icon-18" />
                    Reset
                  </button>
                  <button
                    className="spec-reset-btn"
                    onClick={() => setActiveSubTab('details')}
                    style={{ background: 'rgba(255, 255, 255, 0.06)' }}
                  >
                    View In-Depth Specialization Details
                  </button>
                </div>
              </div>
            ) : (
              /* Render Question and Options */
              <div>
                <div className="spec-finder-question">
                  {currentSpecNode.question}
                </div>
                <div className="spec-finder-options">
                  {currentSpecNode.options?.map((option) => {
                    const isTitan = specPath[0]?.value === 'titan' || option.value === 'titan';
                    return (
                      <button
                        key={option.value}
                        className={`spec-finder-option-btn ${isTitan ? 'titan-choice' : ''}`}
                        onClick={() => setSpecPath([...specPath, { label: option.label.split(' (')[0], value: option.value }])}
                      >
                        <span>{option.label}</span>
                      </button>
                    );
                  })}
                </div>
                
                {specPath.length > 0 && (
                  <button className="spec-reset-btn" onClick={() => setSpecPath(specPath.slice(0, -1))}>
                    Go Back
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. Secondary View: Full Detailed Guides (Under "More Details" tab) */}
      {activeSubTab === 'details' && (
        <div className="spec-details-tab animate-fade-in" style={{ marginTop: '20px' }}>
          <div className="spec-grid">
            {specializationsData.sections.map((sec, sidx) => {
              const cleanTitle = sec.title.replace(' (Robot)', '').replace(' (Titan)', '');
              const isTitan = sec.title.includes('(Titan)');
              const slots = getSpecializationSlots(sec.title, sec.slots);

              return (
                <div 
                  className="glass-panel glass-panel-hover spec-card" 
                  key={sidx}
                  onClick={() => {
                    onItemClick?.(cleanTitle, 'Specialization', { 
                      description: sec.description, 
                      slots,
                      isTitan 
                    });
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onItemClick?.(cleanTitle, 'Specialization', { 
                        description: sec.description, 
                        slots,
                        isTitan 
                      });
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`View details for ${cleanTitle}`}
                >
                  <div className="spec-title-bar">
                    <span className="spec-class-tag" style={{
                      background: !isTitan ? 'rgba(6, 182, 212, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                      color: !isTitan ? 'var(--cyan)' : 'var(--purple)',
                      borderColor: !isTitan ? 'rgba(6, 182, 212, 0.2)' : 'rgba(59, 130, 246, 0.2)'
                    }}>
                      {!isTitan ? 'Robot' : 'Titan'}
                    </span>
                    <h3 style={{ fontSize: '18px' }}>{cleanTitle}</h3>
                  </div>

                  <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px', whiteSpace: 'pre-line' }}>
                    {sec.description}
                  </p>

                  <div className="spec-card-slots">
                    {slots.map((slot, slidx) => {

                      return (
                        <div className="spec-slot-box" key={slidx} style={{ padding: '12px' }}>
                          <div className="spec-slot-title" style={{ color: isTitan ? 'var(--purple)' : 'var(--cyan)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                            <img src="/icons/module_old_gold.png" alt="" className="icon-18" />
                            <span>{slot.name}</span>
                          </div>

                          <ModuleList modules={slot.recommendations} />

                          <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0, whiteSpace: 'pre-line' }}>
                            {slot.content}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
