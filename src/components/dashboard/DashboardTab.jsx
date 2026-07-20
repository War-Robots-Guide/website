import { useMemo } from 'react';
import robotGuideData from '../../data/robot_guide.json';
import weaponsDpsData from '../../data/weapons_dps.json';
import tiersData from '../../data/tiers.json';

import { DashboardHero } from './DashboardHero';
import { QuickStats } from './QuickStats';
import { FeaturedRobots } from './FeaturedRobots';
import { CommunityLinks } from './CommunityLinks';
import { Changelog } from './Changelog';

export function DashboardTab({ onItemClick }) {
  // Memoize featured robots to avoid inline filtering and sorting on every render
  const featuredRobots = useMemo(() => {
    if (!robotGuideData?.robots) return [];

    // 1. Get F2P friendly robots (value_rating >= 31)
    const f2p = robotGuideData.robots
      .filter(r => r.value_rating >= 31)
      .sort((a, b) => b.value_rating - a.value_rating)
      .slice(0, 6)
      .map(r => ({ ...r, isMeta: false }));

    // 2. Get Meta robots (Tier X from tiersData, and value_rating < 31)
    const tierXNames = new Set(
      tiersData?.Robots?.X?.items?.map(item => item.name.toLowerCase()) || []
    );

    const meta = robotGuideData.robots
      .filter(r => r.value_rating < 31 && tierXNames.has(r.name.toLowerCase()))
      .sort((a, b) => {
        const overallDiff = b.scores.overall - a.scores.overall;
        if (overallDiff !== 0) return overallDiff;
        return b.value_rating - a.value_rating;
      })
      .slice(0, 2)
      .map(r => ({ ...r, isMeta: true }));

    return [...f2p, ...meta];
  }, []);

  const sortedChangelog = useMemo(() => {
    if (!robotGuideData?.changelog) return [];
    return [...robotGuideData.changelog].sort((a, b) => b.date.localeCompare(a.date));
  }, []);

  // Memoize changelog to avoid inline slicing on every render
  const recentChangelog = useMemo(() => {
    return sortedChangelog.slice(0, 10);
  }, [sortedChangelog]);

  const stats = useMemo(() => {
    const totalRobots = robotGuideData?.robots?.length || 0;
    const totalTitans = robotGuideData?.titans?.length || 0;
    const totalBuilds = robotGuideData?.builds?.length || 0;
    
    let totalWeaponsCount = 0;
    if (weaponsDpsData) {
      Object.keys(weaponsDpsData).forEach(k => {
        totalWeaponsCount += weaponsDpsData[k]?.length || 0;
      });
    }
    
    const latestChange = sortedChangelog[0] || { date: 'N/A', text: 'No recent updates' };
    
    return {
      totalRobots,
      totalTitans,
      totalBuilds,
      totalWeapons: totalWeaponsCount,
      latestChange
    };
  }, [sortedChangelog]);

  const handleCardClick = (item) => {
    if (!onItemClick) return;

    const category = 'Robots';
    const description = item.comments;

    onItemClick(item.name, category, { description });
  };

  return (
    <div className="animate-fade-in">
      <DashboardHero />

      <QuickStats stats={stats} />

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', textAlign: 'left' }} className="responsive-split">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <FeaturedRobots featuredRobots={featuredRobots} handleCardClick={handleCardClick} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <CommunityLinks />
          <Changelog recentChangelog={recentChangelog} style={{ flex: 1 }} />
        </div>
      </div>
    </div>
  );
}
