import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import process from 'node:process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = path.join(__dirname, '../dist');
const ROUTES = ['dashboard', 'tiers', 'robots', 'builds', 'specializations', 'pilots', 'weapons', 'hangar'];

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

  // 1. Copy index.html to 404.html as a fallback
  const fallbackPath = path.join(DIST_DIR, '404.html');
  fs.writeFileSync(fallbackPath, indexContent, 'utf-8');
  console.log('Created fallback: dist/404.html');

  // 2. Generate subdirectories and index.html files for each route
  ROUTES.forEach(route => {
    const routeDir = path.join(DIST_DIR, route);

    if (!fs.existsSync(routeDir)) {
      fs.mkdirSync(routeDir, { recursive: true });
    }

    const routeIndexPath = path.join(routeDir, 'index.html');
    fs.writeFileSync(routeIndexPath, indexContent, 'utf-8');
    console.log(`Created route: dist/${route}/index.html`);
  });

  console.log('Static pre-rendering complete!');
}

prerender();
