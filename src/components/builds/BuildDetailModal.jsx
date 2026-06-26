import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export function BuildDetailModal({ build, onClose }) {
  useEffect(() => {
    if (!build) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [build, onClose]);

  if (!build) return null;

  return createPortal(
    <div 
      className="modal-overlay" 
      onClick={onClose} 
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="modal-title"
    >
      <div className="modal-content text-left" style={{ maxWidth: '650px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <span className="spec-class-tag" style={{ background: 'rgba(6, 182, 212, 0.1)', color: 'var(--cyan)', borderColor: 'rgba(6, 182, 212, 0.2)', marginBottom: '4px', display: 'inline-block' }}>
              {build.robot}
            </span>
            <h3 id="modal-title" style={{ fontSize: '22px' }}>{build.parsed_build_name}</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>
        
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="build-meta-item">
              <span className="build-meta-label" style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Pilot options</span>
              <span className="build-meta-value" style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>{build.parsed_pilot}</span>
            </div>
            
            <div className="build-meta-item">
              <span className="build-meta-label" style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>specializations & modules</span>
              <span className="build-meta-value" style={{ fontSize: '12.5px', lineHeight: 1.5, color: '#fff' }}>
                {build.parsed_specialization.map((line, lidx) => (
                  <div key={lidx}>{line}</div>
                ))}
              </span>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
            <span className="build-meta-label" style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Weapon Options</span>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>F2P SETUPS</span>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>{build.f2p_weapons || 'N/A'}</p>
              </div>
              <div style={{ flex: 1, borderLeft: '1px solid var(--border-light)', paddingLeft: '16px' }}>
                <span style={{ fontSize: '10px', color: '#fbbf24', fontWeight: 600, display: 'block', marginBottom: '4px' }}>META SETUPS</span>
                <p style={{ fontSize: '13px', color: '#fbbf24', margin: 0 }}>{build.best_weapons || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
            <span className="build-meta-label" style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Drone Options</span>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>F2P DRONES</span>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>{build.f2p_drones || 'N/A'}</p>
              </div>
              <div style={{ flex: 1, borderLeft: '1px solid var(--border-light)', paddingLeft: '16px' }}>
                <span style={{ fontSize: '10px', color: '#fbbf24', fontWeight: 600, display: 'block', marginBottom: '4px' }}>META DRONES</span>
                <p style={{ fontSize: '13px', color: '#fbbf24', margin: 0 }}>{build.best_drones || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>Description:</span>
            <p style={{ color: 'var(--text-primary)', fontSize: '14.5px', lineHeight: 1.6, margin: 0 }}>
              {build.explanation}
            </p>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
