import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

/** Timed bottom sheet that appears after 3 minutes in demo mode */
const DemoTimedPrompt = () => {
  const { isDemoUser } = useAuth();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!isDemoUser || dismissed) return;
    const timer = setTimeout(() => setVisible(true), 180_000); // 3 minutes
    return () => clearTimeout(timer);
  }, [isDemoUser, dismissed]);

  if (!isDemoUser || !visible || dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-0 inset-x-0 z-50 p-4 pb-6"
      >
        <div className="container mx-auto max-w-md">
          <div className="relative bg-card border border-border rounded-2xl shadow-card p-6 text-center">
            <button
              onClick={() => setDismissed(true)}
              className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
            <Sparkles className="w-8 h-8 text-primary mx-auto mb-3" />
            <h3 className="font-display text-lg font-semibold text-foreground mb-1">
              Enjoying finBloom?
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Your real finances could look like this.
            </p>
            <Button variant="hero" size="lg" className="w-full gap-2" asChild>
              <Link to="/auth">
                Create free account <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <p className="text-xs text-muted-foreground mt-2">Takes 2 minutes</p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

/** Inline prompt for Net Worth card */
export const DemoNetWorthPrompt = () => {
  const { isDemoUser } = useAuth();
  if (!isDemoUser) return null;

  return (
    <div className="mt-4 p-3 rounded-xl bg-primary/5 border border-primary/20 text-center">
      <p className="text-xs text-muted-foreground mb-2">
        This is Alex's demo data. Want to see your real net worth?
      </p>
      <Button variant="hero" size="sm" className="text-xs h-7 gap-1" asChild>
        <Link to="/auth">
          Connect your accounts <ArrowRight className="w-3 h-3" />
        </Link>
      </Button>
    </div>
  );
};

/** Toast-style prompt after mission completion */
export const DemoMissionPrompt = ({ xp }: { xp: number }) => {
  const { isDemoUser } = useAuth();
  if (!isDemoUser) return null;

  return (
    <div className="mt-3 p-3 rounded-xl bg-success/10 border border-success/20 text-center">
      <p className="text-xs text-foreground font-medium mb-1">
        You just earned {xp} XP! 🎉
      </p>
      <Link to="/auth" className="text-xs text-primary font-medium hover:underline inline-flex items-center gap-1">
        Create your account to keep your progress <ArrowRight className="w-3 h-3" />
      </Link>
    </div>
  );
};

export default DemoTimedPrompt;
