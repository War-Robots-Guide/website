import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import process from 'node:process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = path.join(__dirname, '../dist');
const ROUTES = ['dashboard', 'tiers', 'robots', 'builds', 'specializations', 'pilots', 'weapons', 'hangar'];

const ROUTE_METADATA = {
  dashboard: {
    title: 'War Robots Guide Database & Tools',
    description: 'Find optimal builds, check out tier lists, chart weapon DPS, and run hangar analysis at the War Robots Guide community database!'
  },
  tiers: {
    title: 'War Robots Meta Tier List | War Robots Guide',
    description: 'Browse the latest meta tiers and community placements for Robots, Titans, Drones, Motherships, and Weapons.'
  },
  robots: {
    title: 'War Robots Ratings & Guide | War Robots Guide',
    description: 'Compare ratings, roles, and longevity scores for all robots and titans. Find optimal F2P and premium builds.'
  },
  builds: {
    title: 'War Robots Optimal Builds | War Robots Guide',
    description: 'Detailed setup recommendations for every major robot, showcasing optimal weapons, drones, pilots, and module specializations.'
  },
  specializations: {
    title: 'Module Specialization Layouts | War Robots Guide',
    description: 'Guide to class-based module layouts and passive upgrade priorities for robots and titans.'
  },
  pilots: {
    title: 'Best Pilot Skills & Builds | War Robots Guide',
    description: 'Find recommended pilot skills categorized by tier efficiency (Must Use, Usually Use, etc.) for all robots and titans.'
  },
  weapons: {
    title: 'Weapon DPS Statistics & Charts | War Robots Guide',
    description: 'Compare weapon burst and cycle DPS, ranges, reload speeds, and special weapon mechanics in an interactive chart.'
  },
  hangar: {
    title: 'Hangar Analyzer & Optimizer | War Robots Guide',
    description: 'Analyze your active hangar composition. Get personalized feedback on role balance, upgrade paths, and optimal loadouts.'
  }
};

function replaceMeta(html, metadata) {
  return html
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${metadata.title}</title>`)
    .replace(/<meta name="description" content=".*?" \/>/, `<meta name="description" content="${metadata.description}" />`)
    .replace(/<meta property="og:title" content=".*?" \/>/, `<meta property="og:title" content="${metadata.title}" />`)
    .replace(/<meta property="og:description" content=".*?" \/>/, `<meta property="og:description" content="${metadata.description}" />`)
    .replace(/<meta name="twitter:title" content=".*?" \/>/, `<meta name="twitter:title" content="${metadata.title}" />`)
    .replace(/<meta name="twitter:description" content=".*?" \/>/, `<meta name="twitter:description" content="${metadata.description}" />`);
}

function prerender() {
  console.log('Starting static pre-rendering...');

  // Ensure dist directory exists
  if (!fs.existsSync(DIST_DIR)) {
    console.error(`Error: build directory "${DIST_DIR}" does not exist.`);
    process.exit(1);
  }

  const indexPath = path.join(DIST_DIR, 'index.html');
  if (!fs.existsSync(indexPath)) {
    console.error('Error: dist/index.html not found.');
    process.exit(1);
  }

  const indexContent = fs.readFileSync(indexPath, 'utf-8');

  // 1. Update root index.html with dashboard metadata
  const updatedRootContent = replaceMeta(indexContent, ROUTE_METADATA.dashboard);
  fs.writeFileSync(indexPath, updatedRootContent, 'utf-8');
  console.log('Updated root: dist/index.html with default metadata');

  // 2. Copy root index.html to 404.html as a fallback (using dashboard metadata)
  const fallbackPath = path.join(DIST_DIR, '404.html');
  fs.writeFileSync(fallbackPath, updatedRootContent, 'utf-8');
  console.log('Created fallback: dist/404.html');

  // 3. Generate subdirectories and index.html files for each route with route-specific metadata
  ROUTES.forEach(route => {
    const routeDir = path.join(DIST_DIR, route);

    if (!fs.existsSync(routeDir)) {
      fs.mkdirSync(routeDir, { recursive: true });
    }

    const routeIndexPath = path.join(routeDir, 'index.html');
    const metadata = ROUTE_METADATA[route] || ROUTE_METADATA.dashboard;
    const routeContent = replaceMeta(indexContent, metadata);
    fs.writeFileSync(routeIndexPath, routeContent, 'utf-8');
    console.log(`Created route: dist/${route}/index.html with route metadata`);
  });

  // 4. Expose raw JSON database endpoints in dist for LLM crawlers
  console.log('Exposing raw database JSON endpoints for AI models...');
  const srcDataDir = path.join(__dirname, '../src/data');
  const distSrcDataDir = path.join(DIST_DIR, 'src/data');

  if (fs.existsSync(srcDataDir)) {
    if (!fs.existsSync(distSrcDataDir)) {
      fs.mkdirSync(distSrcDataDir, { recursive: true });
    }
    const files = fs.readdirSync(srcDataDir);
    let copiedCount = 0;
    files.forEach(file => {
      if (file.endsWith('.json')) {
        fs.copyFileSync(path.join(srcDataDir, file), path.join(distSrcDataDir, file));
        copiedCount++;
      }
    });
    console.log(`Successfully exposed ${copiedCount} database JSON files to dist/src/data/`);
  } else {
    console.warn(`Warning: src/data directory "${srcDataDir}" not found. No JSON files copied.`);
  }

  console.log('Static pre-rendering complete!');
}

prerender();
