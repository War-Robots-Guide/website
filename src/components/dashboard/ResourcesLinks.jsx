import { ExternalLink, FileSpreadsheet, FileText } from 'lucide-react';

export function ResourcesLinks() {
  const resources = [
    {
      title: 'Mini Build Guides',
      url: 'https://docs.google.com/spreadsheets/d/1YWA__vUbC3Go9dHwLorLNp0Tiqpi0Nopor2v8EVE0u8/edit?gid=434493644#gid=434493644',
      icon: FileSpreadsheet,
    },
    {
      title: 'Weapon DPS Spreadsheet',
      url: 'https://docs.google.com/spreadsheets/d/1I5_8WEDmkwIASnI5oiGcvjEtGkjPdrtwXVTJhXIbFhk/edit',
      icon: FileSpreadsheet,
    },
    {
      title: 'All Items Tier List',
      url: 'https://docs.google.com/spreadsheets/d/1-omPIwe8FHM17jxO-Hsio3UWfuVWnKLDbBABqcjYx1U/edit',
      icon: FileSpreadsheet,
    },
    {
      title: 'WR Tier Lists & Rationales',
      url: 'https://docs.google.com/document/d/13R6krA4HDkBXx5H1wIMowYzKy_iVrjsZJAU_0ZD8qCI/edit',
      icon: FileText,
    },
    {
      title: 'Newbie Guide / F2P Value Ratings',
      url: 'https://docs.google.com/spreadsheets/d/1dhN7NIqEHeqeOEPgWYlQHUw4gIbsLXX1fckebfsLpm8/edit',
      icon: FileSpreadsheet,
    },
    {
      title: 'Specializations Guide',
      url: 'https://docs.google.com/document/d/1l0pqNAmf7VrYRyb2d-39r2liuCyKl9p9PH3SqOa0dH8/edit',
      icon: FileText,
    },
    {
      title: 'Pilot Skills Guide',
      url: 'https://docs.google.com/document/d/1xTv5A4erxGEad1iGalEuGyG5lHu0ARQmtwXc3_oKRSs/edit',
      icon: FileText,
    },
  ];

  return (
    <div className="glass-panel resources-panel" style={{ padding: '20px', marginTop: '20px' }}>
      <h3 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 16px 0', color: '#fff' }}>
        <img src="/icons/blackmarket_gold.png" alt="" className="icon-22" />
        Resources & Guides
      </h3>

      <div className="stack-10">
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
                <div className="shrinkable">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                      {res.title}
                    </span>
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
