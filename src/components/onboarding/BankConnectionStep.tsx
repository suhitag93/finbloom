import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { OnboardingData } from "@/pages/Onboarding";
import { ArrowLeft, Building2, Shield, Zap, Loader2 } from "lucide-react";
import { usePlaid } from "@/hooks/usePlaid";

interface Props {
  data: OnboardingData;
  update: (d: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const BankConnectionStep = ({ data, update, onNext, onBack }: Props) => {
  const { startPlaidLink, openWhenReady, loading, syncing, ready: plaidReady } = usePlaid(() => {
    update({ connectedBank: true });
  });

  useEffect(() => {
    if (plaidReady) openWhenReady();
  }, [plaidReady, openWhenReady]);

  return (
    <div className="flex flex-col min-h-[calc(100dvh-80px)]">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="font-display text-xl font-semibold text-foreground">Connect your accounts</h2>
          <p className="text-sm text-muted-foreground mt-1">Securely link your bank for personalized insights.</p>
        </div>
      </div>

      <div className="flex-1">
        <div className="p-5 rounded-2xl bg-card border border-border space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-sage flex items-center justify-center mx-auto">
            <Building2 className="w-7 h-7 text-primary-foreground" />
          </div>

          <div className="text-center space-y-2">
            <h3 className="font-display text-lg font-semibold text-foreground">Secure Bank Connection</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We use bank-level encryption to securely read your transactions. We never store your bank credentials.
            </p>
          </div>

          <div className="space-y-3">
            {[
              { icon: Shield, text: "256-bit encryption" },
              { icon: Zap, text: "Read-only access — we can never move money" },
              { icon: Building2, text: "Powered by trusted financial data providers" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 p-3 rounded-xl bg-sage-light/50 min-h-[44px]">
                <Icon className="w-4 h-4 text-primary shrink-0" />
                <span className="text-sm text-foreground">{text}</span>
              </div>
            ))}
          </div>

          {data.connectedBank && (
            <div className="text-center p-4 rounded-xl bg-secondary border border-primary/20">
              <p className="text-sm font-medium text-primary">✓ Accounts connected successfully</p>
            </div>
          )}
        </div>
      </div>

      <div className="pt-4 pb-safe space-y-3">
        {data.connectedBank ? (
          <Button variant="hero" size="lg" className="w-full" onClick={onNext}>
            Continue
          </Button>
        ) : (
          <>
            <Button variant="hero" size="lg" className="w-full" onClick={startPlaidLink} disabled={loading || syncing}>
              {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Initializing…</>
                : syncing ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Syncing accounts…</>
                : "Connect Bank Account"}
            </Button>
            <Button variant="ghost" size="lg" className="w-full" onClick={onNext}>
              Skip for now
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default BankConnectionStep;
