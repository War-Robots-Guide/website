export function CommunityLinks() {
  return (
    <div className="glass-panel">
      <h3 style={{ fontSize: '18px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <img src="/icons/clan_hangar_gold.png" alt="" style={{ width: '26px', height: '26px', objectFit: 'contain' }} /> Join our Official Communities
      </h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.5, marginBottom: '16px' }}>
        Meet fellow commanders, discuss guides, and get detailed hangar feedback from veterans.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <a
          href="https://www.reddit.com/r/WarRobotsGuide/"
          target="_blank"
          rel="noopener noreferrer"
          className="community-card-link"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="community-card-icon reddit" style={{ background: 'none', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src="/icons/reddit_logo.png" alt="Reddit" style={{ width: '32px', height: '32px', objectFit: 'cover' }} />
            </div>
            <div>
              <div style={{ fontWeight: 600 }}>Check out our subreddit!</div>
            </div>
          </div>
        </a>

        <a
          href="https://discord.gg/FPxpXthPS"
          target="_blank"
          rel="noopener noreferrer"
          className="community-card-link"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="community-card-icon discord" style={{ background: 'none', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src="/icons/discord_logo.png" alt="Discord" style={{ width: '32px', height: '32px', objectFit: 'cover' }} />
            </div>
            <div>
              <div style={{ fontWeight: 600 }}>Join our Discord!</div>
            </div>
          </div>
        </a>
      </div>
    </div>
  );
}
