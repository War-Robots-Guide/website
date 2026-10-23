export function CommunityLinks() {
  return (
    <div className="glass-panel">
      <h3 style={{ fontSize: '18px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <img src="/icons/clan_hangar_gold.png" alt="" className="icon-26" /> Join our Official Communities
      </h3>
      <div className="stack-12">
        <a
          aria-label="Reddit"
          href="https://www.reddit.com/r/WarRobotsGuide/"
          target="_blank"
          rel="noopener noreferrer"
          className="community-card-link"
        >
          <div className="row-center-12">
            <div className="community-card-icon reddit community-icon-box" >
              <img src="/icons/reddit_logo.png" alt="Reddit" className="community-avatar" />
            </div>
            <div>
              <div className="text-semibold">Reddit</div>
            </div>
          </div>
        </a>

        <a
          aria-label="Discord"
          href="https://discord.gg/wT7WFzBCTS"
          target="_blank"
          rel="noopener noreferrer"
          className="community-card-link"
        >
          <div className="row-center-12">
            <div className="community-card-icon discord community-icon-box" >
              <img src="/icons/discord_logo.png" alt="Discord" className="community-avatar" />
            </div>
            <div>
              <div className="text-semibold">Discord</div>
            </div>
          </div>
        </a>
      </div>
    </div>
  );
}
