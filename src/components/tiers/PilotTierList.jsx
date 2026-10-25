import { useId, useState } from 'react';
import { UserRound } from 'lucide-react';
import { getPilotTierImage } from '../../utils/pilotTierImages';
import './PilotTierList.css';

const palette = ['x', 's', 'a', 'b', 'c', 'd', 'e', 'f', 'z'];

function PilotPortrait({ name }) {
  const image = getPilotTierImage(name);
  const [failedImage, setFailedImage] = useState(null);
  return (
    <div className="pilot-portrait">
      {image && failedImage !== image
        ? <img src={image} alt={`Portrait of ${name}`} loading="lazy" onError={() => setFailedImage(image)} />
        : <span className="pilot-portrait-placeholder" aria-hidden="true"><UserRound size={36} /></span>}
    </div>
  );
}

export function PilotTierList({ data, searchQuery }) {
  const id = useId();
  const query = searchQuery.trim().toLowerCase();
  const rows = data.tiers.map((tier, index) => ({ ...tier, index,
    items: tier.items.filter(item => item.name.toLowerCase().includes(query)),
  })).filter(tier => tier.items.length > 0);

  return (
    <div className="pilot-tier-list">
      <p className="pilot-tier-intro">
        CrimsonHawk&apos;s personal pilot rankings, just for fun.{' '}
        <a href={data.sourceUrl} target="_blank" rel="noopener noreferrer">View source spreadsheet</a>
      </p>
      {rows.length === 0 && <p role="status">No pilots match your search.</p>}
      {rows.map(tier => {
        const color = palette[Math.min(tier.index, palette.length - 1)];
        return (
          <section className="pilot-tier-row" key={tier.label} aria-labelledby={`${id}-${tier.index}`}
            style={{ '--pilot-tier-color': `var(--tier-${color})`, '--pilot-tier-bg': `var(--tier-${color}-bg)` }}>
            <h2 className="pilot-tier-label" id={`${id}-${tier.index}`}>{tier.label}</h2>
            <ul className="pilot-tier-items">
              {tier.items.map((item, index) => (
                <li className="pilot-tier-card" key={`${item.name}-${index}`}>
                  <PilotPortrait name={item.name} />
                  <span className="pilot-tier-name">{item.name}</span>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
