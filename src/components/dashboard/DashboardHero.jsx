export function DashboardHero() {
  return (
    <div className="hero-banner" style={{ padding: 0, overflow: 'hidden', position: 'relative' }}>
      <img
        src="banner.webp"
        alt="War Robots Hangar Banner"
        className="dashboard-hero-img"
      />
      <div className="dashboard-hero-overlay">
        <h1 className="dashboard-hero-title">
          Welcome to the WRG Database
        </h1>
        <p className="dashboard-hero-desc">
          Welcome to the database compiled by the expert community at <span style={{ color: 'var(--cyan)', fontWeight: 600 }}>War Robots Guide</span>.
          Navigate to the top of the site to browse our extensive collection of helpful resources!
        </p>
      </div>
    </div>
  );
}
