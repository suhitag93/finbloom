import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Target, Link2, Unlink } from "lucide-react";
import { useAccounts } from "@/hooks/useAccounts";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "sonner";

const GOAL_META: Record<string, { emoji: string; label: string }> = {
  emergency_fund: { emoji: "🌱", label: "Emergency Fund" },
  pay_debt: { emoji: "⛓️‍💥", label: "Pay Off Debt" },
  save_for_vacation: { emoji: "🌴", label: "Vacation Fund" },
  retirement: { emoji: "🌳", label: "Retirement" },
  buy_home: { emoji: "🏡", label: "Home Fund" },
  investing: { emoji: "📈", label: "Investing" },
  education: { emoji: "📚", label: "Education" },
};

const GoalsBucketsTab = () => {
  const { accounts, goalAccounts, assignGoal, removeGoalAssignment, loading } = useAccounts();
  const { profile } = useProfile();
  const goals = profile?.goals || [];

  if (loading) return <div className="text-muted-foreground text-sm py-8 text-center">Loading…</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-lg font-semibold text-foreground">Goals & Buckets</h2>
        <p className="text-muted-foreground text-sm">Assign accounts to your financial goals for automatic tracking</p>
      </div>

      {goals.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Target className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground">No goals set yet. Complete onboarding to set your goals.</p>
          </CardContent>
        </Card>
      ) : (
        goals.map((goal: string) => {
          const meta = GOAL_META[goal] || { emoji: "🎯", label: goal.replace(/_/g, " ") };
          const assigned = goalAccounts.filter((ga) => ga.goal_name === goal);
          const assignedAccountIds = new Set(assigned.map((a) => a.account_id));
          const assignedAccounts = accounts.filter((a) => assignedAccountIds.has(a.id));
          const totalBalance = assignedAccounts.reduce((sum, a) => sum + Math.max(0, a.balance), 0);

          return (
            <Card key={goal}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{meta.emoji}</span>
                    <CardTitle className="text-base">{meta.label}</CardTitle>
                  </div>
                  <span className="text-sm font-semibold text-foreground">${totalBalance.toLocaleString()}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {assignedAccounts.map((account) => {
                  const ga = assigned.find((a) => a.account_id === account.id)!;
                  return (
                    <div key={account.id} className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/30">
                      <div className="flex items-center gap-2">
                        <Link2 className="w-3.5 h-3.5 text-primary" />
                        <span className="text-sm font-medium">{account.institution?.name}</span>
                        <span className="text-xs text-muted-foreground">· {account.nickname}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">${account.balance.toLocaleString()}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive/60 hover:text-destructive" onClick={() => { removeGoalAssignment(ga.id); toast.success("Unlinked"); }}>
                          <Unlink className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })}

                {accounts.length > 0 && (
                  <Select onValueChange={(accountId) => { assignGoal(accountId, goal); toast.success("Account assigned! +75 XP 🌱"); }}>
                    <SelectTrigger className="text-xs h-8 bg-primary/5 border-primary/20 text-primary">
                      <SelectValue placeholder="+ Assign an account to this goal" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.filter((a) => !assignedAccountIds.has(a.id)).map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.institution?.name} · {a.nickname} (${a.balance.toLocaleString()})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
};

export default GoalsBucketsTab;
