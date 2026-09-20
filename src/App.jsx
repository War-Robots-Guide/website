import { lazy, Suspense, useState, useEffect } from 'react';
import './App.css';
import { usePathRouting } from './hooks/usePathRouting';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { SupportBanner } from './components/common/SupportBanner';
import { AdazahiEasterEgg } from './components/common/AdazahiEasterEgg';
import { RouteBackgrounds } from './components/common/RouteBackgrounds';
import { DEFAULT_ROUTE_ID, ROUTES_BY_ID, getCanonicalUrl } from './config/routes';

const lazyNamed = (loader, exportName) => lazy(() => (
  loader().then((module) => ({ default: module[exportName] }))
));

const TAB_COMPONENTS = {
  dashboard: lazyNamed(() => import('./components/dashboard/DashboardTab'), 'DashboardTab'),
  tiers: lazyNamed(() => import('./components/tiers/TierListTab'), 'TierListTab'),
  robots: lazyNamed(() => import('./components/robots/RobotsGuideTab'), 'RobotsGuideTab'),
  builds: lazyNamed(() => import('./components/builds/BuildGuidesTab'), 'BuildGuidesTab'),
  specializations: lazyNamed(() => import('./components/specializations/SpecializationsTab'), 'SpecializationsTab'),
  pilots: lazyNamed(() => import('./components/pilots/PilotSkillsTab'), 'PilotSkillsTab'),
  weapons: lazyNamed(() => import('./components/weapons/WeaponsDpsTab'), 'WeaponsDpsTab'),
  hangar: lazyNamed(() => import('./components/hangar/HangarAnalyzerTab'), 'HangarAnalyzerTab'),
};

const DetailModal = lazyNamed(() => import('./components/common/DetailModal'), 'DetailModal');

function App() {
  const [activeTab, setActiveTab] = usePathRouting('dashboard');
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    const route = ROUTES_BY_ID[activeTab] || ROUTES_BY_ID[DEFAULT_ROUTE_ID];
    document.title = route.clientTitle;

    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', route.clientDescription);

    const canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) {
      canonicalLink.setAttribute('href', getCanonicalUrl(route));
    }
  }, [activeTab]);
  const [isEasterEggActive, setIsEasterEggActive] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [isAdazahiEggActive, setIsAdazahiEggActive] = useState(false);
  const [clickCountAdazahi, setClickCountAdazahi] = useState(0);

  const handleDeveloperClick = () => {
    const nextCount = clickCount + 1;
    setClickCount(nextCount);
    if (nextCount === 4) {
      setIsEasterEggActive(true);
      console.log("Easter egg activated! Welcome to the CrimsonHawk theme.");
    }
  };

  const handleAdazahiClick = () => {
    const nextCount = clickCountAdazahi + 1;
    setClickCountAdazahi(nextCount);
    if (nextCount === 8) {
      setIsAdazahiEggActive(true);
      console.log("Adazahi easter egg activated! Welcome to the Adazahi theme.");
    }
  };

  useEffect(() => {
    if (isEasterEggActive) {
      document.body.style.background = '#07080c'; // Neutral dark background to remove blue tint
    } else {
      document.body.style.background = '';
    }
  }, [isEasterEggActive]);

  useEffect(() => {
    const timer = setTimeout(() => {
      window.scrollTo(0, 0);
    }, 0);
    return () => clearTimeout(timer);
  }, [activeTab]);

  const openItemDetails = (name, type, data) => {
    setSelectedItem({ name, type, data, routeId: activeTab });
  };

  const ActiveTabComponent = TAB_COMPONENTS[activeTab] || TAB_COMPONENTS[DEFAULT_ROUTE_ID];
  const activeTabProps = activeTab === 'dashboard'
    ? { onTabChange: setActiveTab, onItemClick: openItemDetails }
    : ['tiers', 'robots', 'specializations'].includes(activeTab)
      ? { onItemClick: openItemDetails }
      : {};

  return (
    <div className="app-container">
      <RouteBackgrounds activeTab={activeTab} isEasterEggActive={isEasterEggActive} />

      <SupportBanner />
      <Header activeTab={activeTab} onTabChange={setActiveTab} isEasterEggActive={isEasterEggActive} />

      <main className={`main-content bg-theme-${activeTab}`}>
        <Suspense fallback={<div className="route-loading" role="status">Loading guide…</div>}>
          <ActiveTabComponent {...activeTabProps} />
        </Suspense>
      </main>

      <Footer onDeveloperClick={handleDeveloperClick} onAdazahiClick={handleAdazahiClick} />

      {isAdazahiEggActive && <AdazahiEasterEgg />}

      {selectedItem?.routeId === activeTab && (
        <Suspense fallback={null}>
          <DetailModal selectedItem={selectedItem} onClose={() => setSelectedItem(null)} />
        </Suspense>
      )}
    </div>
  );
}

export default App;
