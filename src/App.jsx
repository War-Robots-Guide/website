import { useState, useEffect } from 'react';
import './App.css';
import { useHashRouting } from './hooks/useHashRouting';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { DashboardTab } from './components/dashboard/DashboardTab';
import { TierListTab } from './components/tiers/TierListTab';
import { RobotsGuideTab } from './components/robots/RobotsGuideTab';
import { BuildGuidesTab } from './components/builds/BuildGuidesTab';
import { SpecializationsTab } from './components/specializations/SpecializationsTab';
import { PilotSkillsTab } from './components/pilots/PilotSkillsTab';
import { WeaponsDpsTab } from './components/weapons/WeaponsDpsTab';
import { HangarAnalyzerTab } from './components/hangar/HangarAnalyzerTab';
import { DetailModal } from './components/common/DetailModal';

const BACKGROUND_IMAGES = {
  dashboard: '/backgrounds/home-bg.jpg',
  tiers: '/backgrounds/tierlist-bg.jpg',
  robots: '/backgrounds/value-bg.jpg',
  builds: '/backgrounds/buildguides-bg.jpg',
  specializations: '/backgrounds/specializations-bg.jpg',
  pilots: '/backgrounds/pilotskills-bg.jpg',
  weapons: '/backgrounds/dps-bg.jpg',
  hangar: '/backgrounds/hangaranalyzer-bg.jpg',
};

function App() {
  const [activeTab, setActiveTab] = useHashRouting('dashboard');
  const [selectedItem, setSelectedItem] = useState(null);
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
    if (isEasterEggActive || isAdazahiEggActive) {
      document.body.style.background = '#07080c'; // Neutral dark background to remove blue tint
    } else {
      document.body.style.background = '';
    }
  }, [isEasterEggActive, isAdazahiEggActive]);

  const [lastTab, setLastTab] = useState(activeTab);
  const [currentTab, setCurrentTab] = useState(activeTab);

  if (activeTab !== currentTab) {
    setLastTab(currentTab);
    setCurrentTab(activeTab);
  }

  useEffect(() => {
    setSelectedItem(null);
    const timer = setTimeout(() => {
      window.scrollTo(0, 0);
    }, 0);
    return () => clearTimeout(timer);
  }, [activeTab]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLastTab(activeTab);
    }, 500);
    return () => clearTimeout(timer);
  }, [activeTab]);

  const openItemDetails = (name, type, data) => {
    setSelectedItem({ name, type, data });
  };

  const tabs = ['dashboard', 'tiers', 'robots', 'builds', 'specializations', 'pilots', 'weapons', 'hangar'];

  return (
    <div className="app-container">
      {/* Background Layers for cross-browser fading transitions */}
      <div className="bg-layers">
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          const isVisible = tab === activeTab || tab === lastTab;

          let bgUrl = 'none';
          if (isVisible) {
            if (isAdazahiEggActive) {
              bgUrl = "url('/backgrounds/easteregg-adazahi-bg.jpg')";
            } else if (isEasterEggActive) {
              bgUrl = "url('/backgrounds/easteregg-crimsonhawk-bg.jpg')";
            } else {
              bgUrl = `url('${BACKGROUND_IMAGES[tab]}')`;
            }
          }

          return (
            <div
              key={tab}
              className={`bg-layer bg-theme-${tab} ${isActive ? 'active' : ''}`}
              style={{
                backgroundImage: bgUrl,
                opacity: isActive ? (isEasterEggActive || isAdazahiEggActive ? 0.75 : 0.15) : 0
              }}
            />
          );
        })}
      </div>

      <Header activeTab={activeTab} onTabChange={setActiveTab} isEasterEggActive={isEasterEggActive || isAdazahiEggActive} />

      <main className={`main-content bg-theme-${activeTab}`}>
        {activeTab === 'dashboard' && <DashboardTab onTabChange={setActiveTab} onItemClick={openItemDetails} />}
        {activeTab === 'tiers' && <TierListTab onItemClick={openItemDetails} />}
        {activeTab === 'robots' && <RobotsGuideTab onItemClick={openItemDetails} />}
        {activeTab === 'builds' && <BuildGuidesTab />}
        {activeTab === 'specializations' && <SpecializationsTab onItemClick={openItemDetails} />}
        {activeTab === 'pilots' && <PilotSkillsTab />}
        {activeTab === 'weapons' && <WeaponsDpsTab />}
        {activeTab === 'hangar' && <HangarAnalyzerTab />}
      </main>

      <Footer onDeveloperClick={handleDeveloperClick} onAdazahiClick={handleAdazahiClick} />

      {selectedItem && (
        <DetailModal selectedItem={selectedItem} onClose={() => setSelectedItem(null)} />
      )}
    </div>
  );
}

export default App;
