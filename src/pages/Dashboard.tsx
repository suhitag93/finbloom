import { useEffect, useState } from "react";
import UserLevelHeader from "@/components/dashboard/UserLevelHeader";
import FinancialHealthSnapshot from "@/components/dashboard/FinancialHealthSnapshot";
import GamifiedMissions from "@/components/dashboard/GamifiedMissions";
import WeeklyCoaching from "@/components/dashboard/WeeklyCoaching";
import SavingsBuckets from "@/components/dashboard/SavingsBuckets";
import GardenLoadingScreen from "@/components/dashboard/GardenLoadingScreen";
import { useProfile } from "@/hooks/useProfile";
import { useAnalytics } from "@/hooks/useAnalytics";
import DemoTimedPrompt from "@/components/DemoConversionPrompts";

const Dashboard = () => {
  const { profile, loading, firstName } = useProfile();
  const { track } = useAnalytics();
  const [gardenComplete, setGardenComplete] = useState(false);

  useEffect(() => {
    if (profile && !loading) {
      track("dashboard_viewed", {
        has_connected_bank: profile.connected_bank ?? false,
        finbloom_level: profile.finbloom_level,
        xp_points: profile.xp_points,
      });
    }
  }, [profile, loading, track]);

  if (loading || !gardenComplete) {
    return <GardenLoadingScreen onComplete={() => setGardenComplete(true)} />;
  }

  return (
    <>
      <div className="px-4 py-4 space-y-3">
        <UserLevelHeader firstName={firstName} />
        <FinancialHealthSnapshot />
        <GamifiedMissions />
        <WeeklyCoaching />
        <SavingsBuckets />
      </div>
      <DemoTimedPrompt />
    </>
  );
};

export default Dashboard;
