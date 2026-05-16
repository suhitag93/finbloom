import GoalsDashboard from "@/components/settings/GoalsDashboard";
import { useGoals } from "@/hooks/useGoals";

const GoalsBucketsTab = () => {
  const { goals, loading } = useGoals();

  if (loading) return <div className="text-muted-foreground text-sm py-8 text-center">Loading…</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-lg font-semibold text-foreground">Goals</h2>
        <p className="text-muted-foreground text-sm">Track your financial goals</p>
      </div>

      <GoalsDashboard />

      {goals.length === 0 && (
        <div className="text-center py-12">
          <span className="text-4xl block mb-3">🌱</span>
          <p className="text-muted-foreground text-sm">No goals yet.</p>
        </div>
      )}
    </div>
  );
};

export default GoalsBucketsTab;
