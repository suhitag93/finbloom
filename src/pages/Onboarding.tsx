import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import WelcomeStep from "@/components/onboarding/WelcomeStep";
import DemographicsStep from "@/components/onboarding/DemographicsStep";
import FinancialProfileStep from "@/components/onboarding/FinancialProfileStep";
import BankConnectionStep from "@/components/onboarding/BankConnectionStep";
import HealthScoreStep from "@/components/onboarding/HealthScoreStep";
import GoalsStep from "@/components/onboarding/GoalsStep";
import GamifiedWelcomeStep from "@/components/onboarding/GamifiedWelcomeStep";

export interface OnboardingData {
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

const TOTAL_STEPS = 7;

const Onboarding = () => {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
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

  const stepVariants = {
    enter: { opacity: 0, x: 40 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -40 },
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress bar */}
      {step > 0 && step < TOTAL_STEPS - 1 && (
        <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-muted">
          <motion.div
            className="h-full bg-gradient-sage rounded-r-full"
            initial={{ width: 0 }}
            animate={{ width: `${((step) / (TOTAL_STEPS - 1)) * 100}%` }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          />
        </div>
      )}

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="w-full max-w-xl"
          >
            {step === 0 && <WelcomeStep onNext={next} />}
            {step === 1 && (
              <DemographicsStep data={data} update={update} onNext={next} onBack={back} />
            )}
            {step === 2 && (
              <FinancialProfileStep data={data} update={update} onNext={next} onBack={back} />
            )}
            {step === 3 && (
              <BankConnectionStep data={data} update={update} onNext={next} onBack={back} />
            )}
            {step === 4 && (
              <HealthScoreStep data={data} onNext={next} onBack={back} />
            )}
            {step === 5 && (
              <GoalsStep data={data} update={update} onNext={next} onBack={back} />
            )}
            {step === 6 && (
              <GamifiedWelcomeStep level={computeLevel()} data={data} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Onboarding;
