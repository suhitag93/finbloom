import { Button } from "@/components/ui/button";
import { OnboardingData } from "@/pages/Onboarding";
import { ArrowLeft } from "lucide-react";

interface Props {
  data: OnboardingData;
  update: (d: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const questions: {
  key: keyof OnboardingData;
  label: string;
  options: { value: string; label: string }[];
}[] = [
  {
    key: "ageGroup",
    label: "What's your age group?",
    options: [
      { value: "18-24", label: "18–24" },
      { value: "25-34", label: "25–34" },
      { value: "35-44", label: "35–44" },
      { value: "45-54", label: "45–54" },
      { value: "55+", label: "55+" },
    ],
  },
  {
    key: "incomeRange",
    label: "What's your income range?",
    options: [
      { value: "<50k", label: "Under $50k" },
      { value: "50k-100k", label: "$50k – $100k" },
      { value: "100k-200k", label: "$100k – $200k" },
      { value: "200k+", label: "$200k+" },
    ],
  },
  {
    key: "employmentType",
    label: "What's your employment type?",
    options: [
      { value: "salaried", label: "Salaried" },
      { value: "self_employed", label: "Self-Employed" },
      { value: "business_owner", label: "Business Owner" },
      { value: "student", label: "Student" },
    ],
  },
  {
    key: "locationType",
    label: "Where do you live?",
    options: [
      { value: "high_cost", label: "High cost city" },
      { value: "medium_cost", label: "Medium cost metro" },
      { value: "suburban", label: "Suburban" },
      { value: "rural", label: "Rural" },
    ],
  },
  {
    key: "household",
    label: "What's your household situation?",
    options: [
      { value: "single", label: "Single" },
      { value: "partnered", label: "Partnered" },
      { value: "partner_kids", label: "Partner + Kids" },
      { value: "single_parent", label: "Single Parent" },
    ],
  },
  {
    key: "financialConfidence",
    label: "How confident are you with finances?",
    options: [
      { value: "beginner", label: "🌱 Beginner" },
      { value: "intermediate", label: "🌿 Intermediate" },
      { value: "advanced", label: "🌳 Advanced" },
    ],
  },
];

const DemographicsStep = ({ data, update, onNext, onBack }: Props) => {
  const allAnswered = questions.every((q) => (data[q.key] as string).length > 0);

  return (
    <div className="flex flex-col min-h-[calc(100dvh-80px)]">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="font-display text-xl font-semibold text-foreground">Tell us about yourself</h2>
          <p className="text-sm text-muted-foreground mt-1">This helps us personalize your experience.</p>
        </div>
      </div>

      <div className="flex-1 space-y-5">
        {questions.map((q) => (
          <div key={q.key} className="space-y-2">
            <label className="text-sm font-medium text-foreground">{q.label}</label>
            <div className="flex flex-wrap gap-2">
              {q.options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => update({ [q.key]: opt.value })}
                  className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 border min-h-[44px] ${
                    data[q.key] === opt.value
                      ? "bg-primary text-primary-foreground border-primary shadow-soft"
                      : "bg-card text-foreground border-border hover:border-primary/40"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="pt-4 pb-safe">
        <Button variant="hero" size="lg" className="w-full" onClick={onNext} disabled={!allAnswered}>
          Continue
        </Button>
      </div>
    </div>
  );
};

export default DemographicsStep;
