export function Changelog({ recentChangelog }) {
  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', padding: 0 }}>
      <h3 style={{
        fontSize: '18px',
        padding: '24px 24px 12px 24px',
        margin: 0,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        borderBottom: '1px solid var(--border-light)'
      }}>
        <img src="/icons/time_gold.png" alt="" style={{ width: '24px', height: '24px', objectFit: 'contain' }} /> Changelog
      </h3>
      <div style={{
        maxHeight: '480px',
        overflowY: 'auto',
        padding: '16px 24px 24px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        {recentChangelog.map((log, index) => (
          <div key={index} style={{ borderLeft: '2px solid var(--cyan)', paddingLeft: '12px' }}>
            <span style={{ fontSize: '11px', color: 'var(--cyan)', fontWeight: 600 }}>{log.date}</span>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
              {log.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
