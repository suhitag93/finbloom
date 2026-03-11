import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import GoalCoach from "@/components/settings/GoalCoach";
import GoalsDashboard from "@/components/settings/GoalsDashboard";
import { useGoals } from "@/hooks/useGoals";

const GoalsBucketsTab = () => {
  const { goals, loading } = useGoals();

  if (loading) return <div className="text-muted-foreground text-sm py-8 text-center">Loading…</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-semibold text-foreground">Goals</h2>
          <p className="text-muted-foreground text-sm">Goals tailored to your profile — coming from onboarding</p>
        </div>
      </div>

      <GoalsDashboard />

      {!showCoach && goals.length === 0 && (
        <div className="text-center py-12">
          <span className="text-4xl block mb-3">🌱</span>
          <p className="text-muted-foreground text-sm mb-4">No goals yet. Let's create your first one!</p>
          <Button onClick={() => setShowCoach(true)}>Start with AI Coach</Button>
        </div>
      )}
    </div>
  );
};

export default GoalsBucketsTab;
