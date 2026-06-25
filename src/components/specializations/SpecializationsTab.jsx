import { useState, useMemo } from 'react';
import { Compass, RefreshCw, Sparkles, Zap } from 'lucide-react';
import specializationsData from '../../data/specializations.json';
import { specTree } from './specTree';

const introParagraphs = specializationsData.intro.split('\n');

export function SpecializationsTab() {
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
      <div className="hero-banner" style={{ padding: '24px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '28px', marginBottom: '8px' }}>Module Specialization Guide</h2>
        <p style={{ margin: '0 auto' }}>
          Learn what specializations and modules are the best for you.
        </p>
      </div>

      {/* Intro text */}
      <div className="glass-panel" style={{ marginBottom: '24px', fontSize: '14px', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
        {introParagraphs.map((para, pidx) => (
          <p key={pidx} style={{ marginBottom: para.startsWith('###') ? '12px' : '8px', marginTop: para.startsWith('###') ? '16px' : '0', fontWeight: para.startsWith('###') ? 700 : 400, color: para.startsWith('###') ? 'var(--cyan)' : 'inherit' }}>
            {para.startsWith('###') ? para.replace('### ', '') : para}
          </p>
        ))}
      </div>

      {/* Interactive Specialization Path Finder */}
      <div className="spec-finder-container" style={{ marginBottom: '24px' }}>
        <div className="spec-finder-content">
          <div className="spec-finder-header">
            <Compass size={22} className="cyan-glow-text" style={{ color: specPath[0]?.value === 'titan' ? 'var(--purple)' : 'var(--cyan)', textShadow: specPath[0]?.value === 'titan' ? '0 0 10px rgba(168, 85, 247, 0.5)' : '0 0 10px rgba(6, 182, 212, 0.5)' }} />
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, fontFamily: 'var(--heading)' }}>
                Interactive Specialization Assistant
              </h3>
              <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                Find the optimal module specializations for your builds step-by-step
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
              <span key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
            /* Render Result */
            <div className={`spec-finder-result ${specPath[0]?.value === 'titan' ? 'titan-result' : ''}`}>
              <div className={`spec-result-title ${specPath[0]?.value === 'titan' ? 'titan-result' : ''}`}>
                <Sparkles size={20} />
                Recommended Specialization: {specPath[specPath.length - 1]?.label}
              </div>
              <div className="spec-result-path">
                Path: {specPath.map(s => s.label).join(' ➔ ')}
              </div>
              
              <div className="spec-result-slots">
                {currentSpecNode.result.slots.map((slot, sIdx) => (
                  <div className="spec-result-slot-box" key={sIdx}>
                    <div className={`spec-result-slot-title ${specPath[0]?.value === 'titan' ? 'titan-result' : ''}`}>
                      <Zap size={14} />
                      {slot.name}
                    </div>
                  </div>
                ))}
              </div>

              <button className="spec-reset-btn" onClick={() => setSpecPath([])}>
                <RefreshCw size={14} />
                Reset & Start Over
              </button>
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
  );
}
