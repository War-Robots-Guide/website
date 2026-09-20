import { describe, expect, it } from 'vitest';
import {
  DEFAULT_ROUTE_ID,
  ROUTES,
  ROUTES_BY_ID,
  getCanonicalUrl,
  getLegacyHashPath,
  getRouteByPath,
} from './routes';

describe('route manifest', () => {
  it('contains unique IDs, paths, and slugs', () => {
    expect(new Set(ROUTES.map((route) => route.id)).size).toBe(ROUTES.length);
    expect(new Set(ROUTES.map((route) => route.path)).size).toBe(ROUTES.length);
    expect(new Set(ROUTES.map((route) => route.slug)).size).toBe(ROUTES.length);
  });

  it('provides complete metadata and assets for every route', () => {
    ROUTES.forEach((route) => {
      expect(route.title).toBeTruthy();
      expect(route.description).toBeTruthy();
      expect(route.clientTitle).toBeTruthy();
      expect(route.clientDescription).toBeTruthy();
      expect(route.background).toMatch(/^\/backgrounds\/.+\.webp$/);
      expect(route.navIcon).toMatch(/^\/icons\/.+\.png$/);
      expect(ROUTES_BY_ID[route.id]).toBe(route);
    });
  });

  it('resolves canonical, alias, and legacy hash paths', () => {
    expect(getRouteByPath('/robots/')).toBe(ROUTES_BY_ID.robots);
    expect(getRouteByPath('/dashboard')).toBe(ROUTES_BY_ID[DEFAULT_ROUTE_ID]);
    expect(getRouteByPath('/missing')).toBeNull();
    expect(getCanonicalUrl(ROUTES_BY_ID.dashboard)).toBe('https://warrobotsguide.com');
    expect(getCanonicalUrl(ROUTES_BY_ID.tiers)).toBe('https://warrobotsguide.com/tiers');
    expect(getLegacyHashPath('/', '#weapons')).toBe('/weapons');
    expect(getLegacyHashPath('/tiers', '#weapons')).toBeNull();
    expect(getLegacyHashPath('/', '#missing')).toBeNull();
  });
});
