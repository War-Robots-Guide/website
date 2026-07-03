import { useState, useEffect } from 'react';

const ALLOWED_TABS = ['dashboard', 'tiers', 'robots', 'builds', 'specializations', 'pilots', 'weapons', 'hangar'];

export function usePathRouting(defaultTab = 'dashboard') {
  const getInitialTab = () => {
    const path = window.location.pathname.replace(/^\/|\/$/g, '');
    if (path === '' || path === 'index.html') {
      return defaultTab;
    }
    return ALLOWED_TABS.includes(path) ? path : defaultTab;
  };

  const [activeTab, setActiveTabState] = useState(getInitialTab);

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.replace(/^\/|\/$/g, '');
      if (path === '' || path === 'index.html') {
        setActiveTabState(defaultTab);
      } else if (ALLOWED_TABS.includes(path)) {
        setActiveTabState(path);
      } else {
        setActiveTabState(defaultTab);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [defaultTab]);

  const setActiveTab = (tab) => {
    if (ALLOWED_TABS.includes(tab)) {
      const currentPath = window.location.pathname.replace(/^\/|\/$/g, '');
      const targetTab = tab === defaultTab ? '' : tab;
      
      if (currentPath !== targetTab) {
        const newPath = tab === defaultTab ? '/' : `/${tab}`;
        window.history.pushState(null, '', newPath);
        setActiveTabState(tab);
      }
    }
  };

  return [activeTab, setActiveTab];
}
