import { useState, useEffect } from 'react';
import { DEFAULT_ROUTE_ID, ROUTES_BY_ID, getRouteByPath } from '../config/routes';

export function usePathRouting(defaultTab = DEFAULT_ROUTE_ID) {
  const getInitialTab = () => {
    return getRouteByPath(window.location.pathname)?.id || defaultTab;
  };

  const [activeTab, setActiveTabState] = useState(getInitialTab);

  useEffect(() => {
    const handlePopState = () => {
      setActiveTabState(getRouteByPath(window.location.pathname)?.id || defaultTab);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [defaultTab]);

  const setActiveTab = (tab) => {
    const route = ROUTES_BY_ID[tab];
    if (!route || route.path === window.location.pathname) return;

    window.history.pushState(null, '', route.path);
    setActiveTabState(tab);
  };

  return [activeTab, setActiveTab];
}
