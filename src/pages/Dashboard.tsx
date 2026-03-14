import { useEffect, useState, useCallback, lazy, Suspense } from "react";
import { useLocation } from "react-router-dom";
import { Heart, Zap, Sprout, BookOpen } from "lucide-react";
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
import SavingsBuckets from "@/components/dashboard/SavingsBuckets";
import GardenLoadingScreen from "@/components/dashboard/GardenLoadingScreen";
import { MobileDashboardAccordion } from "@/components/dashboard/MobileDashboardAccordion";
import type { AccordionSection } from "@/components/dashboard/MobileDashboardAccordion";
import { useProfile } from "@/hooks/useProfile";
import { useAnalytics } from "@/hooks/useAnalytics";
import DemoBanner from "@/components/DemoBanner";
import DemoTimedPrompt from "@/components/DemoConversionPrompts";

const SpendingOverview = lazy(() => import("@/components/dashboard/SpendingOverview"));

const Dashboard = () => {
  const { profile, loading, firstName } = useProfile();
  const location = useLocation();
  const { track } = useAnalytics();
  const [openAccordionIds, setOpenAccordionIds] = useState<string[]>(["overview"]);
  const [gardenComplete, setGardenComplete] = useState(false);

  // Track dashboard_viewed once profile loads
  useEffect(() => {
    if (profile && !loading) {
      track("dashboard_viewed", {
        has_connected_bank: profile.connected_bank ?? false,
        finbloom_level: profile.finbloom_level,
        xp_points: profile.xp_points,
      });
    }
  }, [profile, loading, track]);

  const toggleAccordion = useCallback((id: string) => {
    setOpenAccordionIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  // When hash changes, open only that accordion section and scroll to it
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      const sectionIds = ["overview", "spending", "growth", "guide"];
      if (sectionIds.includes(id)) {
        setOpenAccordionIds([id]);
      }
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 250);
    }
  }, [location.hash, location.key]);

  // Show garden loading screen while data loads
  if (loading || !gardenComplete) {
    return <GardenLoadingScreen onComplete={() => setGardenComplete(true)} />;
  }

  const mobileAccordionSections: AccordionSection[] = [
    {
      id: "overview",
      label: "Overview",
      emoji: "💚",
      icon: Heart,
      children: (
        <>
          <FinancialHealthSnapshot />
          <NetWorthCard />
          <SmartAlerts />
        </>
      ),
    },
    {
      id: "spending",
      label: "Spending",
      emoji: "💳",
      icon: Zap,
      children: (
        <>
          <Suspense fallback={<div className="h-48 rounded-2xl bg-secondary/30 animate-pulse" />}>
            <SpendingOverview />
          </Suspense>
          <RecommendationCard />
        </>
      ),
    },
    {
      id: "growth",
      label: "Growth Garden",
      emoji: "🌱",
      icon: Sprout,
      children: (
        <>
          <GoalTracker goals={profile?.goals} />
          <SavingsBuckets />
          <AchievementsBadges />
          <LevelProgressionMap />
        </>
      ),
    },
    {
      id: "guide",
      label: "Weekly Guide",
      emoji: "📖",
      icon: BookOpen,
      children: (
        <>
          <WeeklyCoaching />
          <WeeklyCheckIn />
          <GamifiedMissions />
          <MonthlyReport />
        </>
      ),
    },
  ];

  return (
    <>
    <DemoBanner />
    <div className="min-h-screen pb-12 px-4 pt-4 md:pt-6">
      <div className="container mx-auto max-w-6xl">
        {/* Welcome header */}
        <UserLevelHeader firstName={firstName} />


        {/* ===== MOBILE: Accordion layout ===== */}
        <MobileDashboardAccordion sections={mobileAccordionSections} openIds={openAccordionIds} onToggle={toggleAccordion} />

        {/* ===== DESKTOP: Single-column rows ===== */}
        <div className="hidden md:flex flex-col gap-6">
          {/* Row 1: Financial Health + Active Missions */}
          <div id="spending" className="flex gap-4 scroll-mt-4">
            <div className="flex-1 min-w-0"><FinancialHealthSnapshot /></div>
            <div className="flex-1 min-w-0"><GamifiedMissions /></div>
          </div>

          {/* Row 2: Weekly Insights + Bloom Weekly Review */}
          <div id="coaching" className="flex gap-4 scroll-mt-6">
            <div className="flex-1 min-w-0"><WeeklyCoaching /></div>
            <div className="flex-1 min-w-0"><WeeklyCheckIn /></div>
          </div>

          {/* Row 3: Savings (full width) */}
          <SavingsBuckets />

          {/* Remaining sections */}
          <div id="goals" className="scroll-mt-6">
            <GoalTracker goals={profile?.goals} />
          </div>

          <div className="flex gap-4">
            <div className="flex-1 min-w-0">
              <Suspense fallback={<div className="h-64 rounded-2xl bg-card animate-pulse" />}>
                <SpendingOverview />
              </Suspense>
            </div>
            <div className="flex-1 min-w-0"><RecommendationCard /></div>
          </div>

          <div id="achievements" className="flex gap-4 scroll-mt-6">
            <div className="flex-1 min-w-0"><LevelProgressionMap /></div>
            <div className="flex-1 min-w-0"><AchievementsBadges /></div>
          </div>

          <div id="networth" className="flex gap-4 scroll-mt-6">
            <div className="flex-1 min-w-0"><NetWorthCard /></div>
            <div className="flex-1 min-w-0"><MonthlyReport /></div>
          </div>

          <div id="alerts" className="scroll-mt-6">
            <SmartAlerts />
          </div>
        </div>
      </div>
    </div>
    <DemoTimedPrompt />
    </>
  );
};

export default Dashboard;
