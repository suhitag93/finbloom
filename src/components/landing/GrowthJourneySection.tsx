import { motion } from "framer-motion";
import { ArrowRight, Lock } from "lucide-react";
import { LEVELS } from "@/lib/xp-system";

const GrowthJourneySection = () => {
  const displayLevels = LEVELS.slice(0, 5); // Show first 5

  return (
    <section id="growth-journey" className="py-24 px-4 bg-secondary/30">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-4">
            Your growth journey
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Progress through growth stages — each one unlocking new tools, insights, and real-world rewards.
          </p>
        </motion.div>

        <div className="relative">
          {/* Connection line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-border -translate-y-1/2 z-0" />

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6 relative z-10">
            {displayLevels.map((level, i) => (
              <motion.div
                key={level.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="relative p-6 rounded-2xl bg-card shadow-card border border-border/50 text-center"
              >
                <motion.div
                  className="text-4xl mb-3"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
                >
                  {level.emoji}
                </motion.div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-1">
                  {level.title}
                </h3>
                <p className="text-xs text-muted-foreground mb-3">{level.focus}</p>

                {/* Unlock preview */}
                <div className="space-y-1.5">
                  {level.unlocks.slice(0, 2).map((unlock) => (
                    <div
                      key={unlock}
                      className="flex items-center gap-1.5 text-xs text-muted-foreground"
                    >
                      {i === 0 ? (
                        <span className="w-3 h-3 rounded-full bg-success/20 flex items-center justify-center text-[8px]">✓</span>
                      ) : (
                        <Lock className="w-3 h-3 text-muted-foreground/50" />
                      )}
                      <span className="truncate">{unlock}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-3 text-xs font-medium text-primary">
                  {level.xpRequired.toLocaleString()} XP
                </div>

                {i < displayLevels.length - 1 && (
                  <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 text-muted-foreground/30">
                    <ArrowRight className="w-6 h-6" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default GrowthJourneySection;
