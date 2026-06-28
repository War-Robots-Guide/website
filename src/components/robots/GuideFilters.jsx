import { SearchInput } from '../common/SearchInput';

export function GuideFilters({
  guideSubTab,
  searchInput,
  setSearchInput,
  robotValueFilter,
  setRobotValueFilter,
  robotRoleFilter,
  setRobotRoleFilter
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
        {guideSubTab === 'robots' && (
          <>
            <option value="5">Value Rating 5</option>
            <option value="4">Value Rating 4</option>
          </>
        )}
        <option value="3">Value Rating 3</option>
        <option value="2">Value Rating 2</option>
        <option value="1">Value Rating 1</option>
        <option value="0">Value Rating 0</option>
        <option value="-1">Value Rating -1</option>
        <option value="-2">Value Rating -2</option>
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
    </div>
  );
}
