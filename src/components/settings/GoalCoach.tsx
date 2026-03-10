import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Sparkles, Loader2, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAccounts } from "@/hooks/useAccounts";
import { useFinancialData } from "@/hooks/useFinancialData";
import { useGoals } from "@/hooks/useGoals";
import { toast } from "sonner";

type Step = "select" | "questions" | "analyzing" | "plan" | "creating";

interface CoachPlan {
  message: string;
  recommended_monthly: number;
  target_amount: number;
  target_date: string;
  title: string;
  insights: string[];
}

const GOAL_TYPES = [
  { id: "emergency_fund", emoji: "🛡️", title: "Emergency Fund", desc: "Build your financial safety net" },
  { id: "debt_payoff", emoji: "💳", title: "Debt Payoff", desc: "Break free from what you owe" },
  { id: "investment", emoji: "📈", title: "Investment Goal", desc: "Put your money to work" },
];

const QUESTIONS: Record<string, { key: string; question: string; options?: { label: string; value: string }[]; inputType?: string }[]> = {
  emergency_fund: [
    { key: "months", question: "How many months of expenses do you want to cover?", options: [{ label: "1–2 months", value: "1-2" }, { label: "3–6 months", value: "3-6" }, { label: "6+ months", value: "6+" }] },
    { key: "existing", question: "Do you have an existing emergency fund?", options: [{ label: "No, starting fresh", value: "none" }, { label: "Some savings", value: "some" }, { label: "Yes, topping up", value: "topping_up" }] },
  ],
  debt_payoff: [
    { key: "debt_type", question: "What type of debt are you targeting?", options: [{ label: "Credit card", value: "credit_card" }, { label: "Student loan", value: "student_loan" }, { label: "Personal loan", value: "personal_loan" }, { label: "Multiple types", value: "multiple" }] },
    { key: "total_balance", question: "What's your total balance?", inputType: "number" },
    { key: "knows_apr", question: "Do you know your interest rate?", options: [{ label: "Not sure", value: "unsure" }, { label: "Yes, I'll enter it", value: "yes" }] },
  ],
  investment: [
    { key: "purpose", question: "What are you investing toward?", options: [{ label: "Retirement", value: "retirement" }, { label: "Wealth building", value: "wealth" }, { label: "Major purchase", value: "purchase" }] },
    { key: "timeline", question: "What's your timeline?", options: [{ label: "1–3 years", value: "1-3" }, { label: "3–10 years", value: "3-10" }, { label: "10+ years", value: "10+" }] },
    { key: "experience", question: "Have you invested before?", options: [{ label: "Never", value: "never" }, { label: "A little", value: "some" }, { label: "Yes, want to grow", value: "experienced" }] },
  ],
};

interface Props {
  onComplete: () => void;
}

const GoalCoach = ({ onComplete }: Props) => {
  const [step, setStep] = useState<Step>("select");
  const [goalType, setGoalType] = useState("");
  const [questionIdx, setQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [plan, setPlan] = useState<CoachPlan | null>(null);
  const [editPlan, setEditPlan] = useState<{ title: string; target: string; monthly: string; date: string; accountId: string }>({ title: "", target: "", monthly: "", date: "", accountId: "" });

  const { accounts } = useAccounts();
  const { spendingByCategory, totalSpending, totalInvestments, totalDebt } = useFinancialData();
  const { createGoal } = useGoals();

  const questions = goalType ? QUESTIONS[goalType] : [];
  const currentQ = questions[questionIdx];

  const handleSelectGoal = (type: string) => {
    setGoalType(type);
    setQuestionIdx(0);
    setAnswers({});
    setStep("questions");
  };

  const handleAnswer = (value: string) => {
    const newAnswers = { ...answers, [currentQ.key]: value };
    setAnswers(newAnswers);
    if (questionIdx < questions.length - 1) {
      setQuestionIdx(questionIdx + 1);
    } else {
      runAnalysis(newAnswers);
    }
  };

  const runAnalysis = async (finalAnswers: Record<string, string>) => {
    setStep("analyzing");
    try {
      const { data, error } = await supabase.functions.invoke("goal-coach", {
        body: {
          goalType,
          answers: finalAnswers,
          financialContext: {
            totalSpending,
            spendingByCategory,
            totalInvestments,
            totalDebt,
            accounts: accounts.map((a) => ({ nickname: a.nickname, account_type: a.account_type, balance: a.balance })),
          },
        },
      });
      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
        setStep("select");
        return;
      }
      setPlan(data);
      setEditPlan({
        title: data.title || GOAL_TYPES.find((g) => g.id === goalType)?.title || "My Goal",
        target: String(data.target_amount || 5000),
        monthly: String(data.recommended_monthly || 200),
        date: data.target_date || "",
        accountId: "",
      });
      setStep("plan");
    } catch (e) {
      console.error(e);
      toast.error("Couldn't reach the AI coach. Try again.");
      setStep("select");
    }
  };

  const handleCreate = async () => {
    setStep("creating");
    await createGoal({
      goal_type: goalType,
      title: editPlan.title,
      description: plan?.message || null,
      target_amount: Number(editPlan.target),
      current_amount: 0,
      monthly_contribution: Number(editPlan.monthly) || null,
      target_date: editPlan.date || null,
      linked_account_id: editPlan.accountId || null,
      status: "active",
      coach_notes: plan?.insights?.join("\n") || null,
    });
    onComplete();
  };

  return (
    <div className="space-y-4">
      <AnimatePresence mode="wait">
        {/* STEP 1: Goal Selection */}
        {step === "select" && (
          <motion.div key="select" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-3">
            <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10">
              <p className="text-sm text-foreground">Hey! 🌿 I'm your FinBloom coach. Let's set a goal that fits your real finances. What are you working toward?</p>
            </div>
            <div className="grid gap-3">
              {GOAL_TYPES.map((g) => (
                <button key={g.id} onClick={() => handleSelectGoal(g.id)} className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-soft transition-all text-left">
                  <span className="text-2xl">{g.emoji}</span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{g.title}</p>
                    <p className="text-xs text-muted-foreground">{g.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* STEP 2: Questions */}
        {step === "questions" && currentQ && (
          <motion.div key={`q-${questionIdx}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3">
            <Button variant="ghost" size="sm" onClick={() => { if (questionIdx === 0) { setStep("select"); } else { setQuestionIdx(questionIdx - 1); } }}>
              <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back
            </Button>
            <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10">
              <p className="text-sm text-foreground">{currentQ.question}</p>
            </div>
            {currentQ.options ? (
              <div className="grid gap-2">
                {currentQ.options.map((opt) => (
                  <button key={opt.value} onClick={() => handleAnswer(opt.value)} className="p-3 rounded-xl bg-card border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all text-left text-sm font-medium text-foreground">
                    {opt.label}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex gap-2">
                <Input type="number" placeholder="Enter amount" value={answers[currentQ.key] || ""} onChange={(e) => setAnswers({ ...answers, [currentQ.key]: e.target.value })} className="flex-1" />
                <Button onClick={() => handleAnswer(answers[currentQ.key] || "0")} disabled={!answers[currentQ.key]}>Next</Button>
              </div>
            )}
            <div className="flex gap-1">
              {questions.map((_, i) => (
                <div key={i} className={`h-1 flex-1 rounded-full ${i <= questionIdx ? "bg-primary" : "bg-secondary"}`} />
              ))}
            </div>
          </motion.div>
        )}

        {/* STEP 3: Analyzing */}
        {step === "analyzing" && (
          <motion.div key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center py-12 gap-4">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Analyzing your finances…</p>
          </motion.div>
        )}

        {/* STEP 4: AI Plan */}
        {step === "plan" && plan && (
          <motion.div key="plan" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            <Button variant="ghost" size="sm" onClick={() => setStep("select")}>
              <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Start over
            </Button>
            <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10 space-y-2">
              <div className="flex items-center gap-1.5 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-medium text-primary">FinBloom Coach</span>
              </div>
              <p className="text-sm text-foreground whitespace-pre-line">{plan.message}</p>
            </div>

            {plan.insights?.length > 0 && (
              <div className="space-y-1.5">
                {plan.insights.map((insight, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <Check className="w-3 h-3 text-primary mt-0.5 shrink-0" />
                    <span>{insight}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="bg-card rounded-xl border border-border/50 p-4 space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Your Goal Plan</p>
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Title</label>
                <Input value={editPlan.title} onChange={(e) => setEditPlan({ ...editPlan, title: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Target ($)</label>
                  <Input type="number" value={editPlan.target} onChange={(e) => setEditPlan({ ...editPlan, target: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Monthly ($)</label>
                  <Input type="number" value={editPlan.monthly} onChange={(e) => setEditPlan({ ...editPlan, monthly: e.target.value })} />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Target date</label>
                <Input type="date" value={editPlan.date} onChange={(e) => setEditPlan({ ...editPlan, date: e.target.value })} />
              </div>
              {accounts.length > 0 && (
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Link account</label>
                  <Select value={editPlan.accountId} onValueChange={(v) => setEditPlan({ ...editPlan, accountId: v })}>
                    <SelectTrigger className="text-sm"><SelectValue placeholder="Select an account" /></SelectTrigger>
                    <SelectContent>
                      {accounts.map((a) => (
                        <SelectItem key={a.id} value={a.id}>{a.nickname} (${a.balance.toLocaleString()})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <Button className="w-full" onClick={handleCreate}>🌱 Create this goal</Button>
          </motion.div>
        )}

        {step === "creating" && (
          <motion.div key="creating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center py-12 gap-4">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Creating your goal…</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GoalCoach;
