import { useEffect, useRef, useState } from 'react';

export function SlidingTabPills({ tabs, activeTab, onChange }) {
  const containerRef = useRef(null);
  const [style, setStyle] = useState({ left: 0, width: 0, opacity: 0 });

  useEffect(() => {
    const updatePosition = () => {
      if (containerRef.current) {
        const activeIdx = tabs.findIndex(t => t.value === activeTab);
        const buttons = containerRef.current.querySelectorAll('.tab-pill');
        const activeEl = buttons[activeIdx];
        if (activeEl) {
          setStyle({
            left: activeEl.offsetLeft,
            width: activeEl.clientWidth,
            opacity: 1
          });
        }
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, [activeTab, tabs]);

  return (
    <div className="tab-pills" ref={containerRef} style={{ position: 'relative' }}>
      <div 
        className="tab-pill-indicator" 
        style={{
          position: 'absolute',
          top: '4px',
          bottom: '4px',
          left: `${style.left}px`,
          width: `${style.width}px`,
          opacity: style.opacity,
          transition: 'all 0.22s cubic-bezier(0.25, 1, 0.5, 1)',
          pointerEvents: 'none',
          zIndex: 0
        }} 
      />
      {tabs.map((tab) => (
        <button
          key={tab.value}
          className={`tab-pill ${activeTab === tab.value ? 'active' : ''}`}
          onClick={() => onChange(tab.value)}
          style={{ position: 'relative', zIndex: 1 }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
