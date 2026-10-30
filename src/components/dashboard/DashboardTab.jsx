import { stripTagsAndAsterisks } from '../../utils/tierLookup';
import { useMemo } from 'react';
import robotGuideData from '../../data/robot_guide.json';
import weaponsDpsData from '../../data/weapons_dps.json';
import tiersData from '../../data/tiers.json';

import { DashboardHero } from './DashboardHero';
import { QuickStats } from './QuickStats';
import { FeaturedRobots } from './FeaturedRobots';
import { CommunityLinks } from './CommunityLinks';
import { Changelog } from './Changelog';
import { ResourcesLinks } from './ResourcesLinks';

export function DashboardTab({ onTabChange, onItemClick }) {
  // Memoize featured robots to avoid inline filtering and sorting on every render
  const featuredRobots = useMemo(() => {
    if (!robotGuideData?.robots) return [];

    // 1. Feature the highest-value accessible robots.
    const f2p = robotGuideData.robots
      .filter(r => r.scores?.accessibility >= 4)
      .sort((a, b) => b.value_rating - a.value_rating)
      .slice(0, 6);

    // 2. Feature the strongest X-tier robots with low accessibility.
    const tierXNames = new Set(
      tiersData?.Robots?.X?.items?.map(item => stripTagsAndAsterisks(item.name).toLowerCase()) || []
    );

    const meta = robotGuideData.robots
      .filter(r => r.scores?.accessibility <= 3 && tierXNames.has(stripTagsAndAsterisks(r.name).toLowerCase()))
      .sort((a, b) => {
        const overallDiff = b.scores.overall - a.scores.overall;
        if (overallDiff !== 0) return overallDiff;
        return b.value_rating - a.value_rating;
      })
      .slice(0, 2);

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
    let description = item.comments;
    if (tiersData?.Robots) {
      for (const tierKey of Object.keys(tiersData.Robots)) {
        const found = tiersData.Robots[tierKey]?.items?.find(
          tItem => stripTagsAndAsterisks(tItem.name).toLowerCase() === stripTagsAndAsterisks(item.name).toLowerCase()
        );
        if (found && found.description) {
          description = found.description;
          break;
        }
      }
    }

    if (onTabChange) {
      onTabChange('tiers');
    }
    if (onItemClick) {
      onItemClick(item.name, 'Robots', { description }, 'tiers');
    }
  };

  return (
    <div className="animate-fade-in">
      <DashboardHero />

      <QuickStats stats={stats} />

      <div className="dashboard-layout-grid">
        <div className="dashboard-main-col">
          <FeaturedRobots featuredRobots={featuredRobots} handleCardClick={handleCardClick} />
        </div>

        <div className="dashboard-side-col">
          <CommunityLinks />
          <div className="changelog-wrapper">
            <Changelog recentChangelog={recentChangelog} />
          </div>
          <ResourcesLinks />
        </div>
      </div>
    </div>
  );
}
