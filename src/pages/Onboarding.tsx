import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAnalytics } from "@/hooks/useAnalytics";
import WelcomeStep from "@/components/onboarding/WelcomeStep";
import PersonalInfoStep from "@/components/onboarding/PersonalInfoStep";
import DemographicsStep from "@/components/onboarding/DemographicsStep";
import FinancialProfileStep from "@/components/onboarding/FinancialProfileStep";
import BankConnectionStep from "@/components/onboarding/BankConnectionStep";
import HealthScoreStep from "@/components/onboarding/HealthScoreStep";
import GoalsStep from "@/components/onboarding/GoalsStep";
import GamifiedWelcomeStep from "@/components/onboarding/GamifiedWelcomeStep";

export interface OnboardingData {
  fullName: string;
  dateOfBirth: string;
  ageGroup: string;
  incomeRange: string;
  employmentType: string;
  locationType: string;
  household: string;
  financialConfidence: string;
  financialAccounts: string[];
  connectedBank: boolean;
  goals: string[];
}

const TOTAL_STEPS = 8;

const Onboarding = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { track } = useAnalytics();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    fullName: "",
    dateOfBirth: "",
    ageGroup: "",
    incomeRange: "",
    employmentType: "",
    locationType: "",
    household: "",
    financialConfidence: "",
    financialAccounts: [],
    connectedBank: false,
    goals: [],
  });

  const next = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));
  const update = (partial: Partial<OnboardingData>) =>
    setData((prev) => ({ ...prev, ...partial }));

  useEffect(() => {
    track("onboarding_started");
  }, [track]);

  const computeLevel = () => {
    const accts = data.financialAccounts;
    const hasInvestments = accts.some((a) =>
      ["401k", "roth_ira", "brokerage", "crypto"].includes(a)
    );
    const hasSavings = accts.includes("savings");
    if (hasInvestments && hasSavings) return data.financialConfidence === "advanced" ? 3 : 2;
    if (hasSavings) return 1;
    return 0;
  };

  const handleComplete = async () => {
    if (!user) return;
    await supabase.from("profiles").update({
      full_name: data.fullName,
      date_of_birth: data.dateOfBirth || null,
      age_group: data.ageGroup,
      income_range: data.incomeRange,
      employment_type: data.employmentType,
      location_type: data.locationType,
      household: data.household,
      financial_confidence: data.financialConfidence,
      financial_accounts: data.financialAccounts,
      connected_bank: data.connectedBank,
      goals: data.goals,
      onboarding_completed: true,
    }).eq("user_id", user.id);
    track("onboarding_completed", {
      financial_confidence: data.financialConfidence,
      goals: data.goals,
    });
    navigate("/dashboard");
  };

  const stepVariants = {
    enter: { opacity: 0, x: 40 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -40 },
  };

  // Progress dots (steps 1-6, not welcome or final)
  const showProgress = step > 0 && step < TOTAL_STEPS - 1;
  const progressSteps = TOTAL_STEPS - 2; // 6 steps with dots

  return (
    <div className="flex flex-col bg-background" style={{ height: "100dvh" }}>
      {/* Progress indicator */}
      {showProgress && (
        <div className="shrink-0 px-4 pt-4 pb-2">
          <div className="flex items-center justify-center gap-2">
            {Array.from({ length: progressSteps }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i < step
                    ? "w-6 bg-primary"
                    : i === step
                    ? "w-6 bg-primary/60"
                    : "w-1.5 bg-muted"
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4" style={{ WebkitOverflowScrolling: "touch" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="w-full max-w-lg mx-auto py-6"
          >
            {step === 0 && <WelcomeStep onNext={next} />}
            {step === 1 && (
              <PersonalInfoStep data={data} update={update} onNext={next} onBack={back} />
            )}
            {step === 2 && (
              <DemographicsStep data={data} update={update} onNext={next} onBack={back} />
            )}
            {step === 3 && (
              <FinancialProfileStep data={data} update={update} onNext={next} onBack={back} />
            )}
            {step === 4 && (
              <BankConnectionStep data={data} update={update} onNext={next} onBack={back} />
            )}
            {step === 5 && (
              <HealthScoreStep data={data} onNext={next} onBack={back} />
            )}
            {step === 6 && (
              <GoalsStep data={data} update={update} onNext={next} onBack={back} />
            )}
            {step === 7 && (
              <GamifiedWelcomeStep level={computeLevel()} data={data} onComplete={handleComplete} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Onboarding;
