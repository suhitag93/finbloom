import { Button } from "@/components/ui/button";
import { OnboardingData } from "@/pages/Onboarding";
import { ArrowLeft, Check } from "lucide-react";

interface Props {
  data: OnboardingData;
  update: (d: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const goalOptions = [
  { value: "emergency_fund", label: "Build emergency fund", icon: "🛡️" },
  { value: "pay_debt", label: "Pay off credit cards", icon: "💳" },
  { value: "start_investing", label: "Start investing", icon: "📈" },
  { value: "buy_home", label: "Buy a home", icon: "🏠" },
  { value: "retirement", label: "Retirement planning", icon: "🌅" },
  { value: "increase_income", label: "Increase income", icon: "💡" },
];

const GoalsStep = ({ data, update, onNext, onBack }: Props) => {
  const toggle = (value: string) => {
    const current = data.goals;
    update({
      goals: current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value],
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="font-display text-2xl font-semibold text-foreground">What are your top goals?</h2>
          <p className="text-sm text-muted-foreground mt-1">Pick the goals that matter most to you right now.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {goalOptions.map((goal) => {
          const selected = data.goals.includes(goal.value);
          return (
            <button
              key={goal.value}
              onClick={() => toggle(goal.value)}
              className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all duration-200 ${
                selected
                  ? "bg-secondary border-primary/40 shadow-soft"
                  : "bg-card border-border hover:border-primary/30"
              }`}
            >
              <span className="text-xl">{goal.icon}</span>
              <span className="flex-1 text-sm font-medium text-foreground">{goal.label}</span>
              {selected && (
                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-3 h-3 text-primary-foreground" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      <Button variant="hero" size="lg" className="w-full" onClick={onNext} disabled={data.goals.length === 0}>
        Continue
      </Button>
    </div>
  );
};

export default GoalsStep;
