import { useEffect, useState, lazy, Suspense } from "react";
import { useLocation } from "react-router-dom";
import UserLevelHeader from "@/components/dashboard/UserLevelHeader";
import FinancialHealthSnapshot from "@/components/dashboard/FinancialHealthSnapshot";
import GoalTracker from "@/components/dashboard/GoalTracker";
import GamifiedMissions from "@/components/dashboard/GamifiedMissions";
import SmartAlerts from "@/components/dashboard/SmartAlerts";
import WeeklyCoaching from "@/components/dashboard/WeeklyCoaching";
import WeeklyCheckIn from "@/components/dashboard/WeeklyCheckIn";
import MonthlyReport from "@/components/dashboard/MonthlyReport";
import RecommendationCard from "@/components/dashboard/RecommendationCard";
import NetWorthCard from "@/components/dashboard/NetWorthCard";
import AchievementsBadges from "@/components/dashboard/AchievementsBadges";
import LevelProgressionMap from "@/components/dashboard/LevelProgressionMap";
import MobileScorecardTabs from "@/components/dashboard/MobileScorecardTabs";
import SavingsBuckets from "@/components/dashboard/SavingsBuckets";
import { useProfile } from "@/hooks/useProfile";

const SpendingOverview = lazy(() => import("@/components/dashboard/SpendingOverview"));

const Dashboard = () => {
  const { profile, loading, firstName } = useProfile();
  const location = useLocation();
  const [scorecardTab, setScorecardTab] = useState("emergency");

  // Scroll to section when hash changes
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [location.hash]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading your dashboard…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12 px-4 pt-4 md:pt-6">
      <div className="container mx-auto max-w-6xl">
        {/* Welcome header — mobile-optimized typography */}
        <UserLevelHeader firstName={firstName} />

        {/* Mobile scorecard tabs */}
        <div id="health" className="mb-4 scroll-mt-4">
          <MobileScorecardTabs activeTab={scorecardTab} onTabChange={setScorecardTab} />
        </div>

        {/* Financial Health + Spending — full-width stacked on mobile */}
        <div id="spending" className="grid lg:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6 scroll-mt-4">
          <FinancialHealthSnapshot />
          <Suspense fallback={<div className="h-64 rounded-2xl bg-card animate-pulse" />}>
            <SpendingOverview />
          </Suspense>
        </div>

        {/* Top priority / Recommendation — shown early on mobile */}
        <div className="mb-4 md:mb-6 md:hidden">
          <RecommendationCard />
        </div>

        {/* Coaching */}
        <div id="coaching" className="grid lg:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6 scroll-mt-6">
          <WeeklyCoaching />
          <WeeklyCheckIn />
        </div>

        {/* Goals */}
        <div id="goals" className="mb-4 md:mb-6 scroll-mt-6">
          <GoalTracker goals={profile?.goals} />
        </div>

        {/* Missions */}
        <div id="missions" className="grid lg:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6 scroll-mt-6">
          <GamifiedMissions />
        </div>

        {/* Achievements */}
        <div id="achievements" className="grid lg:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6 scroll-mt-6">
          <LevelProgressionMap />
          <AchievementsBadges />
        </div>

        {/* Net Worth + Report */}
        <div id="networth" className="grid lg:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6 scroll-mt-6">
          <NetWorthCard />
          <MonthlyReport />
        </div>

        {/* Savings Buckets */}
        <div className="mb-4 md:mb-6">
          <SavingsBuckets />
        </div>

        {/* Alerts + Recommendations */}
        <div id="alerts" className="grid lg:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6 scroll-mt-6">
          <SmartAlerts />
          {/* RecommendationCard already shown on mobile above; show here on desktop */}
          <div className="hidden md:block">
            <RecommendationCard />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
