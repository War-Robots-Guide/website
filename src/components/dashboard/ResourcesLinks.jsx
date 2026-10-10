import { ExternalLink, FileSpreadsheet, FileText } from 'lucide-react';

export function ResourcesLinks() {
  const resources = [
    {
      title: 'Mini Build Guides',
      type: 'Spreadsheet',
      description: 'Optimal loadouts, pilots, weapons, and drone setups for robots',
      url: 'https://docs.google.com/spreadsheets/d/1YWA__vUbC3Go9dHwLorLNp0Tiqpi0Nopor2v8EVE0u8/edit?gid=434493644#gid=434493644',
      icon: FileSpreadsheet,
    },
    {
      title: 'Weapon DPS Spreadsheet',
      type: 'Spreadsheet',
      description: 'Burst & cycle DPS data across all weapon weight classes',
      url: 'https://docs.google.com/spreadsheets/d/1YWA__vUbC3Go9dHwLorLNp0Tiqpi0Nopor2v8EVE0u8/edit',
      icon: FileSpreadsheet,
    },
    {
      title: 'WR Tier Lists & Rationales',
      type: 'Document',
      description: 'Tier rankings, rationales, and meta analysis notes',
      url: 'https://docs.google.com/spreadsheets/d/1YWA__vUbC3Go9dHwLorLNp0Tiqpi0Nopor2v8EVE0u8/edit',
      icon: FileText,
    },
    {
      title: 'The Simplified WR Guide',
      type: 'Guide',
      description: 'Comprehensive robot ratings, evaluations, and role assignments',
      url: 'https://docs.google.com/spreadsheets/d/1YWA__vUbC3Go9dHwLorLNp0Tiqpi0Nopor2v8EVE0u8/edit',
      icon: FileSpreadsheet,
    },
    {
      title: 'Specializations Guide',
      type: 'Document',
      description: 'In-depth module selection guides and build synergy advice',
      url: 'https://docs.google.com/spreadsheets/d/1YWA__vUbC3Go9dHwLorLNp0Tiqpi0Nopor2v8EVE0u8/edit',
      icon: FileText,
    },
    {
      title: 'Pilot Skills Guide',
      type: 'Document',
      description: 'Pilot prioritization guide: Must Use, Usually Use, and Avoid',
      url: 'https://docs.google.com/spreadsheets/d/1YWA__vUbC3Go9dHwLorLNp0Tiqpi0Nopor2v8EVE0u8/edit',
      icon: FileText,
    },
  ];

  return (
    <div className="glass-panel resources-panel" style={{ padding: '20px', marginTop: '20px' }}>
      <h3 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 16px 0', color: '#fff' }}>
        <img src="/icons/blackmarket_gold.png" alt="" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
        Resources & Guides
      </h3>
      <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: '0 0 16px 0', lineHeight: 1.5 }}>
        Explore the official spreadsheets and documentation powering this site.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {resources.map((res, idx) => {
          const Icon = res.icon;
          return (
            <a
              key={idx}
              href={res.url}
              target="_blank"
              rel="noopener noreferrer"
              className="resource-card-link"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-light)',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'rgba(6, 182, 212, 0.1)',
                  color: 'var(--cyan)',
                  flexShrink: 0
                }}>
                  <Icon size={16} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                      {res.title}
                    </span>
                    <span style={{
                      fontSize: '10px',
                      padding: '1px 5px',
                      borderRadius: '4px',
                      background: 'rgba(255, 255, 255, 0.06)',
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      fontWeight: 700
                    }}>
                      {res.type}
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                    {res.description}
                  </div>
                </div>
              </div>
              <ExternalLink size={14} style={{ color: 'var(--text-muted)', flexShrink: 0, marginLeft: '8px' }} />
            </a>
          );
        })}
      </div>
    </div>
  );
}
