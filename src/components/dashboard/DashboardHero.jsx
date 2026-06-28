export function DashboardHero() {
  return (
    <div className="hero-banner" style={{ padding: 0, overflow: 'hidden', position: 'relative' }}>
      <img
        src="banner.jpg"
        alt="War Robots Hangar Banner"
        className="dashboard-hero-img"
      />
      <div className="dashboard-hero-overlay">
        <h1 className="dashboard-hero-title">
          Ultimate War Robots Database & Guides
        </h1>
        <p className="dashboard-hero-desc">
          Welcome to the database compiled by the expert community at <span style={{ color: 'var(--cyan)', fontWeight: 600 }}>r/WarRobotsGuide</span>.
          Get recommendations on weapon DPS, robot ratings, modules, pilots, and meta strategies.
        </p>
      </div>
    </div>
  );
}
