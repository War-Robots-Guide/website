import { GuideDisclosure } from '../common/GuideDisclosure';
import { getUnitType } from '../../utils/equipmentTiers';
import { useMemo, useState } from 'react';
import { PageHero } from '../common/PageHero';
import { SearchInput } from '../common/SearchInput';
import { SlidingTabPills } from '../common/SlidingTabPills';
import guide from '../../data/robot_guide.json';
import { getRobotImage, getRoleIcon } from '../../utils/imageUtils';
import { getRatingTierIndex } from '../../utils/ratingColors';

const bands = [
  { label: 'Best', range: '35+', color: '#38bdf8', index: 4 },
  { label: 'Good', range: '31–34', color: '#22c55e', index: 3 },
  { label: 'Fair', range: '26–30', color: '#eab308', index: 2 },
  { label: 'Poor', range: '21–25', color: '#f97316', index: 1 },
  { label: 'Bad', range: '0–20', color: '#ef4444', index: 0 },
];

export function RobotsGuideTab({ onItemClick }) {
  const [category, setCategory] = useState('robots');
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [valueFilter, setValueFilter] = useState('All');
  const units = useMemo(() => (guide[category] || []).filter(unit =>
    `${unit.name} ${unit.comments}`.toLowerCase().includes(query.toLowerCase()) &&
    (roleFilter === 'All' || unit.roles?.some(role => role.type !== 'none' && role.role === roleFilter)) &&
    (typeFilter === 'All' || getUnitType(unit, category) === typeFilter) &&
    (valueFilter === 'All' || getRatingTierIndex(unit.value_rating) === Number(valueFilter))
  ).sort((a, b) => b.value_rating - a.value_rating), [category, query, roleFilter, typeFilter, valueFilter]);
  const roles = [...new Set((guide[category] || []).flatMap(unit => (unit.roles || []).filter(role => role.type !== 'none').map(role => role.role)))];

  return <div className="animate-fade-in text-left">
    <PageHero title="Value Ratings">Value rating represents F2P friendliness and return on investment.</PageHero>
    <SlidingTabPills tabs={[{ label: 'Robots', value: 'robots' }, { label: 'Titans', value: 'titans' }]} activeTab={category}
      onChange={value => { setCategory(value); setQuery(''); setRoleFilter('All'); setTypeFilter('All'); setValueFilter('All'); }} />
    <div className="search-container">
      <SearchInput placeholder={`Search ${category}...`} value={query} onChange={event => setQuery(event.target.value)} />
      <select className="select-filter" aria-label={`Filter by ${category === 'robots' ? 'robot' : 'titan'} type`} value={typeFilter} onChange={event => setTypeFilter(event.target.value)}>
        <option value="All">All {category === 'robots' ? 'Robot' : 'Titan'} Types</option>
        {[...new Set((guide[category] || []).map(unit => getUnitType(unit, category)))].map(sheet => <option key={sheet}>{sheet}</option>)}
      </select>
      <select className="select-filter" aria-label="Filter by value rating" value={valueFilter} onChange={event => setValueFilter(event.target.value)}>
        <option value="All">All Value Ratings</option>
        {bands.map(band => <option key={band.index} value={band.index}>{band.label} ({band.range})</option>)}
      </select>
      <select className="select-filter" aria-label="Filter by role" value={roleFilter} onChange={event => setRoleFilter(event.target.value)}>
        <option value="All">All Hangar Roles</option>
        {roles.map(role => <option key={role}>{role}</option>)}
      </select>
    </div>
    <GuideDisclosure title="Methodology">
      {(guide.methodology || []).map((paragraph, index) => /^(?:What is |Value Rating Score Definitions)/.test(paragraph)
        ? <h3 key={index}>{paragraph}</h3> : <p key={index}>{paragraph}</p>)}
    </GuideDisclosure>
    <div className="rating-tier-list">
      {bands.map(band => {
        const items = units.filter(unit => getRatingTierIndex(unit.value_rating) === band.index);
        if (!items.length) return null;
        return <section className="rating-tier-row" key={band.label} style={{ '--band-color': band.color }} aria-label={`${band.label} value ratings`}>
          <div className="rating-tier-header"><strong>{band.label}</strong><span>{band.range}</span></div>
          <div className="rating-tier-grid">{items.map(unit => {
            const mainRole = unit.roles?.find(role => role.type === 'main')?.role;
            const roleIcon = getRoleIcon(mainRole);
            const image = getRobotImage(unit.name);
            return <button className="rating-unit" key={unit.name} onClick={() => onItemClick?.(unit.name, category === 'robots' ? 'Robots' : 'Titans', { description: unit.comments })} aria-label={`View details for ${unit.name}`}>
              <div className="rating-unit-portrait">
                <img src={image || '/icons/robot_gold.png'} alt={unit.name} loading="lazy" />
                {mainRole && <span className="rating-role" title={`Main role: ${mainRole}`}>{roleIcon ? <img src={roleIcon} alt={mainRole} /> : mainRole}</span>}
                <span className="rating-number" aria-label={`Value rating ${unit.value_rating}`}>{unit.value_rating}</span>
              </div>
              <span>{unit.name}</span>
            </button>;
          })}</div>
        </section>;
      })}
    </div>
    {!units.length && <p>No matching units.</p>}
  </div>;
}
