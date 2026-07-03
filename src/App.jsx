import { useState, useEffect } from 'react';
import './App.css';
import { usePathRouting } from './hooks/usePathRouting';
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

const TAB_METADATA = {
  dashboard: {
    title: 'War Robots Guide Database & Tools',
    description: 'Welcome to the database compiled by the expert community at War Robots Guide. Navigate to the top of the site to browse our extensive collection of helpful resources!'
  },
  tiers: {
    title: 'War Robots Meta Tier List | War Robots Guide',
    description: 'A power based tier list that ranks every unit in the game.'
  },
  robots: {
    title: 'War Robots Ratings & Guide | War Robots Guide',
    description: 'Value rating represents F2P friendliness and return on investment.'
  },
  builds: {
    title: 'War Robots Optimal Builds | War Robots Guide',
    description: 'Learn the best weapon, specialization, pilot, and drone configurations for your robots.'
  },
  specializations: {
    title: 'Module Specialization Layouts | War Robots Guide',
    description: 'Learn what specializations and modules are the best for you.'
  },
  pilots: {
    title: 'Best Pilot Skills & Builds | War Robots Guide',
    description: 'Learn what pilot skills are the strongest and which skills should be avoided.'
  },
  weapons: {
    title: 'Weapon DPS Statistics & Charts | War Robots Guide',
    description: 'Compare the DPS of most weapons in the game. Select up to four weapons to generate a bar chart.'
  },
  hangar: {
    title: 'Hangar Analyzer & Optimizer | War Robots Guide',
    description: 'Get a general idea of how strong your hangar is.'
  }
};

function App() {
  const [activeTab, setActiveTab] = usePathRouting('dashboard');
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    const meta = TAB_METADATA[activeTab] || TAB_METADATA.dashboard;
    document.title = meta.title;

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', meta.description);
    }

    const canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) {
      const canonicalUrl = `https://warrobotsguide.com${activeTab === 'dashboard' ? '' : '/' + activeTab}`;
      canonicalLink.setAttribute('href', canonicalUrl);
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
    setSelectedItem(null);
  }

  useEffect(() => {
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

          if (!isVisible) return null;

          let bgUrl = 'none';
          if (isAdazahiEggActive) {
            bgUrl = "url('/backgrounds/easteregg-adazahi-bg.jpg')";
          } else if (isEasterEggActive) {
            bgUrl = "url('/backgrounds/easteregg-crimsonhawk-bg.jpg')";
          } else {
            bgUrl = `url('${BACKGROUND_IMAGES[tab]}')`;
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
