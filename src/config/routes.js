export const SITE_URL = 'https://warrobotsguide.com';
export const DEFAULT_ROUTE_ID = 'dashboard';

export const ROUTES = [
  {
    id: 'dashboard',
    path: '/',
    slug: 'dashboard',
    title: 'WarRobotsGuide | Homepage',
    description: 'Welcome to the database compiled by the expert community at War Robots Guide. Navigate to the top of the site to browse our extensive collection of helpful resources!',
    clientTitle: 'WarRobotsGuide | Homepage',
    clientDescription: 'Welcome to the database compiled by the expert community at War Robots Guide. Navigate to the top of the site to browse our extensive collection of helpful resources!',
    background: '/backgrounds/home-bg.webp',
    navLabel: 'Home',
    navIcon: '/icons/ship_gold.png',
    sitemapPriority: '1.0',
  },
  {
    id: 'tiers',
    path: '/tiers',
    slug: 'tiers',
    title: 'WarRobotsGuide | Tier Lists',
    description: 'A power based tier list that ranks every unit in the game.',
    clientTitle: 'WarRobotsGuide | Tier Lists',
    clientDescription: 'Explore our tier list ratings for War Robots. View detailed breakdowns for longevity, lethality, mobility, utility, and overall meta rankings.',
    background: '/backgrounds/tierlist-bg.webp',
    navLabel: 'Tier Lists',
    navIcon: '/icons/hint_operation.png',
    sitemapPriority: '0.9',
  },
  {
    id: 'robots',
    path: '/robots',
    slug: 'robots',
    title: 'WarRobotsGuide | Value Ratings',
    description: 'Value rating represents F2P friendliness and return on investment.',
    clientTitle: 'WarRobotsGuide | Value Ratings',
    clientDescription: 'In-depth performance evaluation and guide scores for every robot in War Robots, calculated by experts.',
    background: '/backgrounds/value-bg.webp',
    navLabel: 'Value Ratings',
    navIcon: '/icons/actions_orange.png',
    sitemapPriority: '0.8',
  },
  {
    id: 'builds',
    path: '/builds',
    slug: 'builds',
    title: 'WarRobotsGuide | Build Guides',
    description: 'Learn the best weapon, specialization, pilot, and drone configurations for your robots.',
    clientTitle: 'WarRobotsGuide | Build Guides',
    clientDescription: 'Curated builds, module pairings, drone setups, and weapons for top-tier War Robots.',
    background: '/backgrounds/buildguides-bg.webp',
    navLabel: 'Build Guides',
    navIcon: '/icons/drone_gold.png',
    sitemapPriority: '0.8',
  },
  {
    id: 'specializations',
    path: '/specializations',
    slug: 'specializations',
    title: 'WarRobotsGuide | Specializations',
    description: 'Learn what specializations and modules are the best for you.',
    clientTitle: 'WarRobotsGuide | Specializations',
    clientDescription: 'Comprehensive database of passive and active modules, titan specializations, and optimal pairings.',
    background: '/backgrounds/specializations-bg.webp',
    navLabel: 'Specializations',
    navIcon: '/icons/module_old_gold.png',
    sitemapPriority: '0.7',
  },
  {
    id: 'pilots',
    path: '/pilots',
    slug: 'pilots',
    title: 'WarRobotsGuide | Pilot Skills',
    description: 'Learn what pilot skills are the strongest and which skills should be avoided.',
    clientTitle: 'WarRobotsGuide | Pilot Skills',
    clientDescription: 'Complete pilot skills list with stat boosts, synergy details, and recommended pilot setups.',
    background: '/backgrounds/pilotskills-bg.webp',
    navLabel: 'Pilot Skills',
    navIcon: '/icons/pilot_gold.png',
    sitemapPriority: '0.7',
  },
  {
    id: 'weapons',
    path: '/weapons',
    slug: 'weapons',
    title: 'WarRobotsGuide | Weapon DPS',
    description: 'Compare the DPS of most weapons in the game. Select up to four weapons to generate a bar chart.',
    clientTitle: 'WarRobotsGuide | Weapon DPS',
    clientDescription: 'Compare weapon DPS, cycle damage, range, reload speed, and burst capabilities.',
    background: '/backgrounds/dps-bg.webp',
    navLabel: 'Weapon DPS',
    navIcon: '/icons/weapon_gold.png',
    sitemapPriority: '0.8',
  },
  {
    id: 'hangar',
    path: '/hangar',
    slug: 'hangar',
    title: 'WarRobotsGuide | Hangar Analyzer',
    description: 'Get a general idea of how strong your hangar is.',
    clientTitle: 'WarRobotsGuide | Hangar Analyzer',
    clientDescription: 'Analyze your War Robots hangar composition, calculate overall power scores, and receive tailored optimization tips.',
    background: '/backgrounds/hangaranalyzer-bg.webp',
    navLabel: 'Hangar Analyzer',
    navIcon: '/icons/microchip_gold.png',
    sitemapPriority: '0.8',
  },
];

export const ROUTES_BY_ID = Object.fromEntries(ROUTES.map((route) => [route.id, route]));
export const ROUTE_IDS = ROUTES.map((route) => route.id);

export function getRouteByPath(pathname) {
  const normalizedPath = pathname.replace(/\/+$/, '') || '/';
  if (normalizedPath === '/index.html' || normalizedPath === '/dashboard') {
    return ROUTES_BY_ID[DEFAULT_ROUTE_ID];
  }
  return ROUTES.find((route) => route.path === normalizedPath) || null;
}

export function getCanonicalUrl(route) {
  return `${SITE_URL}${route.path === '/' ? '' : route.path}`;
}

export function getLegacyHashPath(pathname, hash) {
  if (pathname !== '/' && pathname !== '/index.html') return null;
  const route = ROUTES_BY_ID[hash.replace(/^#/, '')];
  return route?.path || null;
}
