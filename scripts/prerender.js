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
    description: 'Welcome to the database compiled by the expert community at War Robots Guide. Navigate to the top of the site to browse our extensive collection of helpful resources!'
  },
  tiers: {
    title: 'War Robots Meta Tier List | War Robots Guide',
    description: 'A power based tier list that ranks every unit in the game.'
  },
  robots: {
    title: 'War Robots Ratings & Guide | War Robots Guide',
    description: 'Value rating represents F2P friendliness and return on investment.'
  },
  builds: {
    title: 'War Robots Optimal Builds | War Robots Guide',
    description: 'Learn the best weapon, specialization, pilot, and drone configurations for your robots.'
  },
  specializations: {
    title: 'Module Specialization Layouts | War Robots Guide',
    description: 'Learn what specializations and modules are the best for you.'
  },
  pilots: {
    title: 'Best Pilot Skills & Builds | War Robots Guide',
    description: 'Learn what pilot skills are the strongest and which skills should be avoided.'
  },
  weapons: {
    title: 'Weapon DPS Statistics & Charts | War Robots Guide',
    description: 'Compare the DPS of most weapons in the game. Select up to four weapons to generate a bar chart.'
  },
  hangar: {
    title: 'Hangar Analyzer & Optimizer | War Robots Guide',
    description: 'Get a general idea of how strong your hangar is.'
  }
};

function replaceMeta(html, metadata, route) {
  const canonicalUrl = `https://warrobotsguide.com${route === 'dashboard' ? '' : '/' + route}`;
  return html
    .replace(/<link rel="canonical" href=".*?" \/>/, `<link rel="canonical" href="${canonicalUrl}" />`)
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
  const updatedRootContent = replaceMeta(indexContent, ROUTE_METADATA.dashboard, 'dashboard');
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
    const routeContent = replaceMeta(indexContent, metadata, route);
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
