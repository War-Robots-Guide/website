import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import process from 'node:process';
import { DEFAULT_ROUTE_ID, ROUTES, ROUTES_BY_ID, getCanonicalUrl } from '../src/config/routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = path.join(__dirname, '../dist');
const SITEMAP_LAST_MODIFIED = '2026-07-03';

function replaceMeta(html, route) {
  const canonicalUrl = getCanonicalUrl(route);
  return html
    .replace(/<link rel="canonical" href=".*?" \/>/, `<link rel="canonical" href="${canonicalUrl}" />`)
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${route.title}</title>`)
    .replace(/<meta name="description" content=".*?" \/>/, `<meta name="description" content="${route.description}" />`)
    .replace(/<meta property="og:title" content=".*?" \/>/, `<meta property="og:title" content="${route.title}" />`)
    .replace(/<meta property="og:description" content=".*?" \/>/, `<meta property="og:description" content="${route.description}" />`)
    .replace(/<meta name="twitter:title" content=".*?" \/>/, `<meta name="twitter:title" content="${route.title}" />`)
    .replace(/<meta name="twitter:description" content=".*?" \/>/, `<meta name="twitter:description" content="${route.description}" />`);
}

function generateSitemap() {
  const entries = ROUTES.map((route) => `  <url>
    <loc>${getCanonicalUrl(route)}${route.path === '/' ? '/' : ''}</loc>
    <lastmod>${SITEMAP_LAST_MODIFIED}</lastmod>
    <changefreq>daily</changefreq>
    <priority>${route.sitemapPriority}</priority>
  </url>`);

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>
`;

  fs.writeFileSync(path.join(DIST_DIR, 'sitemap.xml'), sitemap, 'utf-8');
  console.log(`Generated sitemap.xml with ${ROUTES.length} canonical routes`);
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
  const defaultRoute = ROUTES_BY_ID[DEFAULT_ROUTE_ID];
  const updatedRootContent = replaceMeta(indexContent, defaultRoute);
  fs.writeFileSync(indexPath, updatedRootContent, 'utf-8');
  console.log('Updated root: dist/index.html with default metadata');

  // 2. Copy root index.html to 404.html as a fallback (using dashboard metadata)
  const fallbackPath = path.join(DIST_DIR, '404.html');
  fs.writeFileSync(fallbackPath, updatedRootContent, 'utf-8');
  console.log('Created fallback: dist/404.html');

  // 3. Generate subdirectories and index.html files for each route with route-specific metadata
  ROUTES.forEach(route => {
    const routeDir = path.join(DIST_DIR, route.slug);

    if (!fs.existsSync(routeDir)) {
      fs.mkdirSync(routeDir, { recursive: true });
    }

    const routeIndexPath = path.join(routeDir, 'index.html');
    const routeContent = replaceMeta(indexContent, route);
    fs.writeFileSync(routeIndexPath, routeContent, 'utf-8');
    console.log(`Created route: dist/${route.slug}/index.html with route metadata`);
  });

  generateSitemap();

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
