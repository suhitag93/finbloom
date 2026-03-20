import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Leaf } from "lucide-react";
import heroBotanical from "@/assets/hero-botanical.png";
import FinBloomIcon from "@/components/FinBloomIcon";
import DemoLoginOverlay from "@/components/DemoLoginOverlay";
import { supabase } from "@/integrations/supabase/client";
import { DEMO_EMAIL } from "@/lib/demo-constants";

const HeroSection = () => {
  const navigate = useNavigate();
  const [demoLoading, setDemoLoading] = useState(false);

  const handleDemoLogin = async () => {
    setDemoLoading(true);
    try {
      // Seed demo account first
      await supabase.functions.invoke("seed-demo-account");

      // Login via edge function (password stays server-side)
      const { data, error } = await supabase.functions.invoke("demo-login");
      if (error) throw error;

      if (data?.access_token && data?.refresh_token) {
        await supabase.auth.setSession({
          access_token: data.access_token,
          refresh_token: data.refresh_token,
        });
        navigate("/dashboard");
      } else {
        throw new Error("Failed to get demo session");
      }
    } catch (err) {
      console.error("Demo login error:", err);
      setDemoLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>{demoLoading && <DemoLoginOverlay />}</AnimatePresence>
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-warm" />
        {/* Floating garden particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {["🌱", "🌸", "🌿", "✨", "🍃"].map((emoji, i) => (
            <motion.span
              key={i}
              className="absolute text-2xl opacity-20"
              style={{ left: `${15 + i * 18}%`, top: `${20 + (i % 3) * 25}%` }}
              animate={{ y: [0, -15, 0], rotate: [0, 10, -10, 0] }}
              transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut" }}
            >
              {emoji}
            </motion.span>
          ))}
        </div>

        <div className="container mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground text-sm font-medium mb-6">
                <Leaf className="w-4 h-4" />
                Your financial wellness garden
              </div>
              <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-semibold text-foreground leading-[1.1] mb-6">
                Plant the seeds.{" "}
                <span className="text-gradient-bloom italic">Watch them bloom.</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-lg mb-8 leading-relaxed">
                Grow your financial life like a garden. Earn XP for real money moves, level up through growth stages, and watch your wealth blossom — one habit at a time.
              </p>
              <div className="flex flex-col items-start gap-3">
                <Link
                  to="/survey"
                  className="inline-flex items-center gap-2 rounded-full bg-[hsl(43,60%,54%)] px-8 py-4 font-body font-bold text-white hover:bg-[hsl(43,60%,46%)] hover:scale-105 transition-all duration-200 text-base"
                >
                  🌱 Help build the app that finally gets it right — takes 5 minutes
                </Link>
                <p className="text-sm font-body text-[hsl(0,0%,40%)]">
                  Completely anonymous · 5 minutes · Your answers shape what gets built
                </p>
              </div>

              {/* Secondary links */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.4 }}
                className="mt-4 flex flex-wrap items-center gap-4 text-sm"
              >
                <button
                  onClick={handleDemoLogin}
                  className="text-muted-foreground hover:text-primary transition-colors underline underline-offset-2"
                  disabled={demoLoading}
                >
                  See it in action
                </button>
                <a href="#how-it-works" className="text-muted-foreground hover:text-primary transition-colors underline underline-offset-2">
                  How it works
                </a>
              </motion.div>

              {/* XP teaser */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="mt-6 flex items-center gap-6 text-sm"
              >
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold-light text-success-foreground font-medium">
                  <Zap className="w-3.5 h-3.5" />
                  +100 XP for signing up
                </div>
                <div className="flex items-center gap-4 text-muted-foreground">
                  <div className="flex -space-x-2">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-full border-2 border-background bg-secondary flex items-center justify-center"
                      >
                        <Star className="w-3 h-3 text-success" />
                      </div>
                    ))}
                  </div>
                  <span>2,000+ growing their finances</span>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="relative hidden lg:block"
            >
              <div className="relative">
                <div className="absolute -inset-4 bg-primary/5 rounded-3xl blur-2xl" />
                <img
                  src={heroBotanical}
                  alt="FinBloom financial growth garden illustration"
                  className="relative rounded-2xl w-full max-w-lg mx-auto animate-float"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
};

export default HeroSection;
