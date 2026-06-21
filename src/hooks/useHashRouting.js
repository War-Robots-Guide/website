import { useState, useEffect } from 'react';

const ALLOWED_TABS = ['dashboard', 'tiers', 'robots', 'builds', 'specializations', 'pilots', 'weapons', 'hangar'];

export function useHashRouting(defaultTab = 'dashboard') {
  const getInitialTab = () => {
    const hash = window.location.hash.replace('#', '');
    return ALLOWED_TABS.includes(hash) ? hash : defaultTab;
  };

  const [activeTab, setActiveTabState] = useState(getInitialTab);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (ALLOWED_TABS.includes(hash)) {
        setActiveTabState(hash);
      } else {
        setActiveTabState(defaultTab);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [defaultTab]);

  const setActiveTab = (tab) => {
    if (ALLOWED_TABS.includes(tab)) {
      window.location.hash = tab;
      setActiveTabState(tab);
    }
  };

  return [activeTab, setActiveTab];
}
