import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import UserLevelHeader from "@/components/dashboard/UserLevelHeader";
import FinancialHealthSnapshot from "@/components/dashboard/FinancialHealthSnapshot";
import SpendingOverview from "@/components/dashboard/SpendingOverview";
import GoalTracker from "@/components/dashboard/GoalTracker";
import GamifiedMissions from "@/components/dashboard/GamifiedMissions";
import SmartAlerts from "@/components/dashboard/SmartAlerts";
import WeeklyCoaching from "@/components/dashboard/WeeklyCoaching";
import MonthlyReport from "@/components/dashboard/MonthlyReport";
import RecommendationCard from "@/components/dashboard/RecommendationCard";
import NetWorthCard from "@/components/dashboard/NetWorthCard";
import AchievementsBadges from "@/components/dashboard/AchievementsBadges";
import LevelProgressionMap from "@/components/dashboard/LevelProgressionMap";
import { useProfile } from "@/hooks/useProfile";

const Dashboard = () => {
  const { profile, loading, firstName } = useProfile();
  const location = useLocation();

  // Scroll to section when hash changes
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      // Small delay to allow render
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
    <div className="min-h-screen pb-12 px-4 pt-6">
      <div className="container mx-auto max-w-6xl">
        <UserLevelHeader firstName={firstName} />

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <FinancialHealthSnapshot />
          <SpendingOverview />
        </div>

        <div id="coaching" className="mb-6 scroll-mt-6">
          <WeeklyCoaching />
        </div>

        <div id="goals" className="mb-6 scroll-mt-6">
          <GoalTracker goals={profile?.goals} />
        </div>

        <div id="missions" className="grid lg:grid-cols-2 gap-6 mb-6 scroll-mt-6">
          <GamifiedMissions />
        </div>

        <div id="achievements" className="grid lg:grid-cols-2 gap-6 mb-6 scroll-mt-6">
          <LevelProgressionMap />
          <AchievementsBadges />
        </div>

        <div id="networth" className="grid lg:grid-cols-2 gap-6 mb-6 scroll-mt-6">
          <NetWorthCard />
          <MonthlyReport />
        </div>

        <div id="alerts" className="grid lg:grid-cols-2 gap-6 mb-6 scroll-mt-6">
          <SmartAlerts />
          <RecommendationCard />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
