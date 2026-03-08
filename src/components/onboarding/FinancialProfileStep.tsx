import { Button } from "@/components/ui/button";
import { OnboardingData } from "@/pages/Onboarding";
import { ArrowLeft, Check } from "lucide-react";

interface Props {
  data: OnboardingData;
  update: (d: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const accounts = [
  { value: "checking", label: "Checking account", icon: "🏦" },
  { value: "savings", label: "Savings account", icon: "💰" },
  { value: "credit_cards", label: "Credit cards", icon: "💳" },
  { value: "student_loans", label: "Student loans", icon: "🎓" },
  { value: "mortgage", label: "Mortgage", icon: "🏠" },
  { value: "401k", label: "401(k)", icon: "📊" },
  { value: "roth_ira", label: "Roth IRA", icon: "📈" },
  { value: "brokerage", label: "Brokerage account", icon: "💹" },
  { value: "crypto", label: "Crypto", icon: "₿" },
];

const FinancialProfileStep = ({ data, update, onNext, onBack }: Props) => {
  const toggle = (value: string) => {
    const current = data.financialAccounts;
    update({
      financialAccounts: current.includes(value)
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
          <h2 className="font-display text-2xl font-semibold text-foreground">Your financial snapshot</h2>
          <p className="text-sm text-muted-foreground mt-1">Select all that apply — this helps us understand your starting point.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {accounts.map((acct) => {
          const selected = data.financialAccounts.includes(acct.value);
          return (
            <button
              key={acct.value}
              onClick={() => toggle(acct.value)}
              className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all duration-200 ${
                selected
                  ? "bg-secondary border-primary/40 shadow-soft"
                  : "bg-card border-border hover:border-primary/30"
              }`}
            >
              <span className="text-xl">{acct.icon}</span>
              <span className="flex-1 text-sm font-medium text-foreground">{acct.label}</span>
              {selected && (
                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-3 h-3 text-primary-foreground" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      <Button variant="hero" size="lg" className="w-full" onClick={onNext} disabled={data.financialAccounts.length === 0}>
        Continue
      </Button>
    </div>
  );
};

export default FinancialProfileStep;
