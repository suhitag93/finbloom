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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading your dashboard…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* User Identity + Level */}
        <UserLevelHeader firstName={firstName} />

        {/* Financial Health + Spending */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <FinancialHealthSnapshot />
          <SpendingOverview />
        </div>

        {/* Growth Garden Goals */}
        <div className="mb-6">
          <GoalTracker goals={profile?.goals} />
        </div>

        {/* Missions */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <GamifiedMissions />
        </div>

        {/* Level Progression + Achievements */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <LevelProgressionMap />
          <AchievementsBadges />
        </div>

        {/* Net Worth + Monthly Report */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <NetWorthCard />
          <MonthlyReport />
        </div>

        {/* Smart Alerts + Recommendations */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <SmartAlerts />
          <RecommendationCard />
        </div>

        {/* Weekly Coaching */}
        <WeeklyCoaching />
      </div>
    </div>
  );
};

export default Dashboard;
