import { SearchInput } from '../common/SearchInput';
import { VALUE_RATING_RANGES, OVERALL_SCORE_RANGES, STAT_SCORE_RANGES } from './constants';

export function GuideFilters({
  guideSubTab,
  searchInput,
  setSearchInput,
  categoryFilter,
  setCategoryFilter,
  availableCategories = [],
  robotValueFilter,
  setRobotValueFilter,
  robotRoleFilter,
  setRobotRoleFilter,
  statFilter,
  setStatFilter,
  minScoreFilter,
  setMinScoreFilter,
  sortBy,
  setSortBy
}) {
  return (
    <div className="search-container">
      <SearchInput
        placeholder={`Search ${guideSubTab}...`}
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
      />

      {/* Category filter (Tier 4 Robots / Tier 3 Robots / Ultimate Robots) */}
      {guideSubTab === 'robots' && availableCategories.length > 1 && (
        <select
          className="select-filter"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="All">All Robot Types</option>
          {availableCategories.map(cat => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      )}

      {/* Value rating filter */}
      <select
        className="select-filter"
        value={robotValueFilter}
        onChange={(e) => setRobotValueFilter(e.target.value)}
      >
        <option value="All">All Value Ratings</option>
        {VALUE_RATING_RANGES.map(range => (
          <option key={range.value} value={range.value}>
            {range.label}
          </option>
        ))}
      </select>

      {/* Roles filter (only for Robots) */}
      {guideSubTab === 'robots' && (
        <select
          className="select-filter"
          value={robotRoleFilter}
          onChange={(e) => setRobotRoleFilter(e.target.value)}
        >
          <option value="All">All Hangar Roles</option>
          <option value="Support">Support</option>
          <option value="Tank-buster">Tank-Buster</option>
          <option value="Sniper">Sniper</option>
          <option value="Midrange">Midrange</option>
          <option value="Brawler">Brawler</option>
          <option value="Beacon Runner">Beacon Runner</option>
          <option value="Assassin">Assassin</option>
        </select>
      )}

      {/* Stat filter */}
      <select
        className="select-filter"
        value={statFilter}
        onChange={(e) => {
          const val = e.target.value;
          setStatFilter(val);
          setMinScoreFilter('All');
        }}
      >
        <option value="All">All Stats</option>
        <option value="longevity">Longevity</option>
        <option value="lethality">Lethality</option>
        <option value="mobility">Mobility</option>
        <option value="utility">Utility</option>
        <option value="accessibility">Accessibility</option>
        <option value="overall">Overall Score</option>
      </select>

      {/* Score filter */}
      {statFilter !== 'All' && (
        <select
          className="select-filter"
          value={minScoreFilter}
          onChange={(e) => setMinScoreFilter(e.target.value)}
        >
          <option value="All">Any Score</option>
          {(statFilter === 'overall' ? OVERALL_SCORE_RANGES : STAT_SCORE_RANGES).map(range => (
            <option key={range.value} value={range.value}>{range.label}</option>
          ))}
        </select>
      )}

      {/* Sort By selector */}
      <select
        className="select-filter"
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
      >
        <option value="Default">Default Sort</option>
        <option value="value_rating">Sort by Value Rating</option>
        <option value="longevity">Sort by Longevity</option>
        <option value="lethality">Sort by Lethality</option>
        <option value="mobility">Sort by Mobility</option>
        <option value="utility">Sort by Utility</option>
        <option value="accessibility">Sort by Accessibility</option>
        <option value="overall">Sort by Overall Score</option>
      </select>
    </div>
  );
}
