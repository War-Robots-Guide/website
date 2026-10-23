import { useId, useState } from 'react';
import { SearchInput } from '../common/SearchInput';

export function WeaponComparison({ weapons }) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState([]);
  const id = useId();
  const matches = query.trim() ? weapons.filter(weapon =>
    weapon.nameLower.includes(query.trim().toLowerCase()) && !selected.some(item => item.id === weapon.id)
  ) : [];
  const maximum = Math.max(1, ...selected.flatMap(weapon => [weapon.burstNum, weapon.cycleNum]));
  return <section className="glass-panel weapon-comparison" aria-label="Weapon comparison">
    <h3>Compare weapons</h3>
    <SearchInput aria-label="Search weapons to compare" placeholder="Search a weapon to compare..." value={query} onChange={event => setQuery(event.target.value)} />
    {query.trim() && <ul className="comparison-results" aria-label="Matching weapons">
      {matches.slice(0, 30).map(weapon => <li key={weapon.id}><button onClick={() => { setSelected(items => [...items, weapon]); setQuery(''); }}>
        {weapon.name} · {weapon.weaponClass}
      </button></li>)}
      {!matches.length && <li>No matching weapons.</li>}
    </ul>}
    {!selected.length && <p>Search and select weapons to compare burst and cycle DPS on the same scale.</p>}
    <div className="comparison-graphs">{selected.map(weapon => <figure key={weapon.id}>
      <figcaption><strong>{weapon.name}</strong><span>{weapon.weaponClass}</span><button aria-label={`Remove ${weapon.name} from comparison`} onClick={() => setSelected(items => items.filter(item => item.id !== weapon.id))}>Remove</button></figcaption>
      <svg viewBox="0 0 300 160" role="img" aria-labelledby={`${id}-${weapon.id}`}>
        <title id={`${id}-${weapon.id}`}>{weapon.name}: Burst DPS {weapon.burst_dps}, Cycle DPS {weapon.cycle_dps}</title>
        <text x="0" y="22" fill="currentColor" fontSize="13">Burst DPS: {weapon.burstNum ? Math.round(weapon.burstNum).toLocaleString() : weapon.burst_dps}</text>
        <rect x="0" y="32" width={280 * weapon.burstNum / maximum} height="28" rx="4" fill="#22d3ee" />
        <text x="0" y="88" fill="currentColor" fontSize="13">Cycle DPS: {weapon.cycleNum ? Math.round(weapon.cycleNum).toLocaleString() : weapon.cycle_dps}</text>
        <rect x="0" y="98" width={280 * weapon.cycleNum / maximum} height="28" rx="4" fill="#a78bfa" />
        <text x="280" y="150" textAnchor="end" fill="currentColor" fontSize="11">{Math.round(maximum).toLocaleString()} DPS</text>
      </svg>
      <p>Range: {weapon.range || '—'} · Unload: {weapon.unload || '—'} · Reload: {weapon.reload || '—'}</p>
    </figure>)}</div>
  </section>;
}
