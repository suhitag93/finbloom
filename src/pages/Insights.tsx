import { lazy, Suspense } from "react";
import WeeklyCoaching from "@/components/dashboard/WeeklyCoaching";
import WeeklyCheckIn from "@/components/dashboard/WeeklyCheckIn";
import MonthlyReport from "@/components/dashboard/MonthlyReport";
import RecommendationCard from "@/components/dashboard/RecommendationCard";
import SmartAlerts from "@/components/dashboard/SmartAlerts";
import DemoBanner from "@/components/DemoBanner";

const SpendingOverview = lazy(() => import("@/components/dashboard/SpendingOverview"));

const Insights = () => (
  <>
    <DemoBanner />
    <div className="px-4 py-4 space-y-3">
      <h1 className="font-display text-xl font-semibold text-foreground">Insights</h1>
      <WeeklyCoaching />
      <WeeklyCheckIn />
      <Suspense fallback={<div className="h-48 rounded-2xl bg-secondary/30 animate-pulse" />}>
        <SpendingOverview />
      </Suspense>
      <RecommendationCard />
      <MonthlyReport />
      <SmartAlerts />
    </div>
  </>
);

export default Insights;
