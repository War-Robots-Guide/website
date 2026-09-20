import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { ROUTES, SITE_URL, getCanonicalUrl } from '../src/config/routes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.join(__dirname, '../dist');
const errors = [];

function fail(message) {
  errors.push(message);
}

function expectFile(filepath, context) {
  if (!fs.existsSync(filepath) || !fs.statSync(filepath).isFile()) {
    fail(`${context}: missing file ${path.relative(DIST_DIR, filepath)}`);
  }
}

function expectContent(html, expected, context) {
  if (!html.includes(expected)) {
    fail(`${context}: missing ${expected}`);
  }
}

function localPathForReference(reference, htmlFile) {
  const cleanReference = reference.split(/[?#]/, 1)[0];
  if (!cleanReference || cleanReference.startsWith('data:')) return null;

  if (/^https?:\/\//.test(cleanReference)) {
    const url = new URL(cleanReference);
    if (url.origin !== SITE_URL) return null;
    const normalizedPath = url.pathname.replace(/\/+$/, '') || '/';
    if (ROUTES.some((route) => route.path === normalizedPath)) return null;
    return path.join(DIST_DIR, decodeURIComponent(url.pathname).replace(/^\//, ''));
  }

  if (cleanReference.startsWith('/')) {
    return path.join(DIST_DIR, decodeURIComponent(cleanReference).replace(/^\//, ''));
  }

  return path.resolve(path.dirname(htmlFile), decodeURIComponent(cleanReference));
}

function verifyHtmlFile(htmlFile, route, context) {
  expectFile(htmlFile, context);
  if (!fs.existsSync(htmlFile)) return;

  const html = fs.readFileSync(htmlFile, 'utf8');
  expectContent(html, `<title>${route.title}</title>`, context);
  expectContent(html, `<meta name="description" content="${route.description}" />`, context);
  expectContent(html, `<link rel="canonical" href="${getCanonicalUrl(route)}" />`, context);
  expectContent(html, 'content="https://warrobotsguide.com/banner.webp"', context);
  expectContent(html, 'href="/WRGICON.png?v=1"', context);

  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const reference = match[1];
    const localPath = localPathForReference(reference, htmlFile);
    if (localPath) expectFile(localPath, `${context} reference ${reference}`);
  }
}

const rootRoute = ROUTES.find((route) => route.path === '/');
expectFile(path.join(DIST_DIR, 'banner.webp'), 'social image');
verifyHtmlFile(path.join(DIST_DIR, 'index.html'), rootRoute, 'root route');
verifyHtmlFile(path.join(DIST_DIR, '404.html'), rootRoute, '404 fallback');

for (const route of ROUTES) {
  verifyHtmlFile(
    path.join(DIST_DIR, route.slug, 'index.html'),
    route,
    `${route.path} route`,
  );
  expectFile(path.join(DIST_DIR, route.background.replace(/^\//, '')), `${route.path} background`);
  expectFile(path.join(DIST_DIR, route.navIcon.replace(/^\//, '')), `${route.path} navigation icon`);
}

const sitemapPath = path.join(DIST_DIR, 'sitemap.xml');
expectFile(sitemapPath, 'sitemap');
if (fs.existsSync(sitemapPath)) {
  const sitemap = fs.readFileSync(sitemapPath, 'utf8');
  for (const route of ROUTES) {
    const sitemapUrl = `${getCanonicalUrl(route)}${route.path === '/' ? '/' : ''}`;
    expectContent(sitemap, `<loc>${sitemapUrl}</loc>`, 'sitemap');
  }
}

for (const filename of ['tiers.json', 'robot_guide.json', 'weapons_dps.json', 'specializations.json', 'pilots.json']) {
  expectFile(path.join(DIST_DIR, 'src/data', filename), 'public JSON database');
}

const serviceWorkerPath = path.join(DIST_DIR, 'sw.js');
expectFile(serviceWorkerPath, 'service worker');
if (fs.existsSync(serviceWorkerPath)) {
  const serviceWorker = fs.readFileSync(serviceWorkerPath, 'utf8');
  expectContent(serviceWorker, 'skipWaiting()', 'service worker update activation');
  expectContent(serviceWorker, 'clientsClaim()', 'service worker client activation');
  expectContent(serviceWorker, 'cleanupOutdatedCaches()', 'service worker cache cleanup');
  expectContent(serviceWorker, 'lazy-route-scripts-v1', 'lazy route script caching');
  expectContent(serviceWorker, 'route-backgrounds-v1', 'lazy background caching');

  const precacheStart = serviceWorker.indexOf('precacheAndRoute(');
  const precacheEnd = serviceWorker.indexOf('cleanupOutdatedCaches()', precacheStart);
  const precacheManifest = serviceWorker.slice(precacheStart, precacheEnd);
  if (/assets\/[^"']+\.js/.test(precacheManifest)) {
    fail('service worker: lazy route scripts must not be downloaded during installation');
  }
}

if (errors.length > 0) {
  console.error('Production build verification failed:');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`Production build verification passed for ${ROUTES.length} routes.`);
