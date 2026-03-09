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
import { MobileDashboardAccordion } from "@/components/dashboard/MobileDashboardAccordion";
import type { AccordionSection } from "@/components/dashboard/MobileDashboardAccordion";
import { useProfile } from "@/hooks/useProfile";

const SpendingOverview = lazy(() => import("@/components/dashboard/SpendingOverview"));

const Dashboard = () => {
  const { profile, loading, firstName } = useProfile();
  const location = useLocation();
  const [openAccordionIds, setOpenAccordionIds] = useState<string[]>(["overview"]);

  const toggleAccordion = useCallback((id: string) => {
    setOpenAccordionIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  // When hash changes, open that accordion section and scroll to it
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      const sectionIds = ["overview", "spending", "growth", "guide"];
      if (sectionIds.includes(id)) {
        setOpenAccordionIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
      }
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
    }
  }, [location.hash]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading your dashboard…</p>
      </div>
    );
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
    <div className="min-h-screen pb-12 px-4 pt-4 md:pt-6">
      <div className="container mx-auto max-w-6xl">
        {/* Welcome header */}
        <UserLevelHeader firstName={firstName} />

        {/* ===== MOBILE: Accordion layout ===== */}
        <MobileDashboardAccordion sections={mobileAccordionSections} />

        {/* ===== DESKTOP: Original grid layout ===== */}
        <div className="hidden md:block space-y-6">
          <div id="spending" className="grid lg:grid-cols-2 gap-6 scroll-mt-4">
            <FinancialHealthSnapshot />
            <Suspense fallback={<div className="h-64 rounded-2xl bg-card animate-pulse" />}>
              <SpendingOverview />
            </Suspense>
          </div>

          <div id="coaching" className="grid lg:grid-cols-2 gap-6 scroll-mt-6">
            <WeeklyCoaching />
            <WeeklyCheckIn />
          </div>

          <div id="goals" className="scroll-mt-6">
            <GoalTracker goals={profile?.goals} />
          </div>

          <div id="missions" className="grid lg:grid-cols-2 gap-6 scroll-mt-6">
            <GamifiedMissions />
          </div>

          <div id="achievements" className="grid lg:grid-cols-2 gap-6 scroll-mt-6">
            <LevelProgressionMap />
            <AchievementsBadges />
          </div>

          <div id="networth" className="grid lg:grid-cols-2 gap-6 scroll-mt-6">
            <NetWorthCard />
            <MonthlyReport />
          </div>

          <SavingsBuckets />

          <div id="alerts" className="grid lg:grid-cols-2 gap-6 scroll-mt-6">
            <SmartAlerts />
            <RecommendationCard />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
