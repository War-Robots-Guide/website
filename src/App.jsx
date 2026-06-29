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

function App() {
  const [activeTab, setActiveTab] = useHashRouting('dashboard');
  const [selectedItem, setSelectedItem] = useState(null);
  const [isEasterEggActive, setIsEasterEggActive] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  const handleDeveloperClick = () => {
    const nextCount = clickCount + 1;
    setClickCount(nextCount);
    if (nextCount === 4) {
      setIsEasterEggActive(true);
      console.log("Easter egg activated! Welcome to the CrimsonHawk theme.");
    }
  };

  useEffect(() => {
    if (isEasterEggActive) {
      document.body.style.background = '#07080c'; // Neutral dark background to remove blue tint
    } else {
      document.body.style.background = '';
    }
  }, [isEasterEggActive]);

  const [prevActiveTab, setPrevActiveTab] = useState(activeTab);
  if (activeTab !== prevActiveTab) {
    setPrevActiveTab(activeTab);
    setSelectedItem(null);
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      window.scrollTo(0, 0);
    }, 0);
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
        {tabs.map((tab) => (
          <div
            key={tab}
            className={`bg-layer bg-theme-${tab} ${activeTab === tab ? 'active' : ''}`}
            style={isEasterEggActive ? { 
              backgroundImage: "url('/backgrounds/easteregg-crimsonhawk-bg.jpg')",
              opacity: activeTab === tab ? 0.75 : 0
            } : {}}
          />
        ))}
      </div>

      <Header activeTab={activeTab} onTabChange={setActiveTab} isEasterEggActive={isEasterEggActive} />

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

      <Footer onDeveloperClick={handleDeveloperClick} />

      {selectedItem && (
        <DetailModal selectedItem={selectedItem} onClose={() => setSelectedItem(null)} />
      )}
    </div>
  );
}

export default App;
