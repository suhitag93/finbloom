import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OnboardingData } from "@/pages/Onboarding";
import { ArrowLeft, User, Calendar } from "lucide-react";

interface Props {
  data: OnboardingData;
  update: (d: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const PersonalInfoStep = ({ data, update, onNext, onBack }: Props) => {
  const isValid = data.fullName.trim().length >= 2 && data.dateOfBirth.length > 0;

  // Calculate max date (must be at least 18)
  const today = new Date();
  const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate())
    .toISOString()
    .split("T")[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="font-display text-2xl font-semibold text-foreground">Let's get to know you</h2>
          <p className="text-sm text-muted-foreground mt-1">
            We'll use this to personalize your financial journey.
          </p>
        </div>
      </div>

      <div className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="fullName" className="text-sm font-medium text-foreground">
            What's your name?
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="fullName"
              type="text"
              placeholder="Your full name"
              value={data.fullName}
              onChange={(e) => update({ fullName: e.target.value })}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="dateOfBirth" className="text-sm font-medium text-foreground">
            When were you born?
          </Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="dateOfBirth"
              type="date"
              value={data.dateOfBirth}
              onChange={(e) => update({ dateOfBirth: e.target.value })}
              max={maxDate}
              className="pl-10"
            />
          </div>
          <p className="text-xs text-muted-foreground">You must be at least 18 years old.</p>
        </div>
      </div>

      <Button variant="hero" size="lg" className="w-full" onClick={onNext} disabled={!isValid}>
        Continue
      </Button>
    </div>
  );
};

export default PersonalInfoStep;
