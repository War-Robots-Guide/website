export function Changelog({ recentChangelog, className = "" }) {
  return (
    <div className={`glass-panel dashboard-changelog ${className}`} style={{ padding: 0 }}>
      <h3 className="changelog-header">
        <img src="/icons/time_gold.png" alt="" className="changelog-icon" /> Changelog
      </h3>
      <div className="changelog-list">
        {recentChangelog.map((log, index) => (
          <div key={index} className="changelog-entry">
            <span className="changelog-date">{log.date}</span>
            <p className="changelog-text">
              {log.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
