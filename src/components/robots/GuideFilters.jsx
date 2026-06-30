import { SearchInput } from '../common/SearchInput';

export function GuideFilters({
  guideSubTab,
  searchInput,
  setSearchInput,
  robotValueFilter,
  setRobotValueFilter,
  robotRoleFilter,
  setRobotRoleFilter,
  statFilter,
  setStatFilter,
  minScoreFilter,
  setMinScoreFilter,
  sortBy,
  setSortBy,
  availableRatings = []
}) {
  return (
    <div className="search-container">
      <SearchInput
        placeholder={`Search ${guideSubTab}...`}
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
      />

      {/* Value rating filter */}
      <select
        className="select-filter"
        value={robotValueFilter}
        onChange={(e) => setRobotValueFilter(e.target.value)}
      >
        <option value="All">All Value Ratings</option>
        {availableRatings.map(rating => (
          <option key={rating} value={rating}>
            Value Rating {rating > 0 ? `+${rating}` : rating}
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
          if (val === 'All') {
            setMinScoreFilter('All');
          } else if (minScoreFilter === 'All') {
            setMinScoreFilter('1'); // Default to +1 minimum when selecting a stat
          }
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

      {/* Minimum Score filter */}
      {statFilter !== 'All' && (
        <select
          className="select-filter"
          value={minScoreFilter}
          onChange={(e) => setMinScoreFilter(e.target.value)}
        >
          <option value="All">Any Score</option>
          <option value="-2">-2 or better</option>
          <option value="-1">-1 or better</option>
          <option value="0">0 or better</option>
          <option value="1">+1 or better</option>
          <option value="2">+2 or better</option>
          <option value="3">+3 or better</option>
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
