import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sprout, CheckCircle2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface WaitlistBannerProps {
  source?: string;
}

const WaitlistBanner = ({ source = "landing" }: WaitlistBannerProps) => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setErrorMsg("Please enter a valid email address");
      setStatus("error");
      return;
    }

    setStatus("loading");
    const { error } = await supabase
      .from("waitlist" as any)
      .insert({ email: trimmed, source } as any);

    if (error) {
      if (error.code === "23505") {
        setStatus("success"); // already on list — treat as success
      } else {
        setErrorMsg("Something went wrong. Please try again.");
        setStatus("error");
      }
    } else {
      setStatus("success");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full rounded-2xl border border-primary/20 bg-primary/5 p-6 md:p-8"
    >
      <AnimatePresence mode="wait">
        {status === "success" ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-2 text-center py-2"
          >
            <CheckCircle2 className="w-8 h-8 text-primary" />
            <p className="font-display text-lg font-semibold text-foreground">
              You're on the list!
            </p>
            <p className="text-muted-foreground text-sm">
              We'll be in touch soon 💚
            </p>
          </motion.div>
        ) : (
          <motion.div key="form" className="flex flex-col items-center gap-4 text-center">
            <div className="flex items-center gap-2">
              <Sprout className="w-5 h-5 text-primary" />
              <h3 className="font-display text-lg md:text-xl font-semibold text-foreground">
                finBloom is growing 🌱
              </h3>
            </div>
            <p className="text-muted-foreground text-sm max-w-md">
              Join the waitlist for early access
            </p>
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-2 w-full max-w-md"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === "error") setStatus("idle");
                }}
                placeholder="you@example.com"
                maxLength={255}
                className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {status === "loading" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Join Waitlist"
                )}
              </button>
            </form>
            {status === "error" && (
              <p className="text-destructive text-xs">{errorMsg}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default WaitlistBanner;
