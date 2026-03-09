import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarCheck, TrendingDown, TrendingUp, Sparkles, CheckCircle2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const WeeklyCheckIn = () => {
  const [completed, setCompleted] = useState(false);
  const xpReward = 40;

  const summaryItems = [
    { label: "Spending", value: "↓ 12%", icon: TrendingDown, positive: true },
    { label: "Savings", value: "↑ $320", icon: TrendingUp, positive: true },
    { label: "Net Worth", value: "↑ $1,200", icon: TrendingUp, positive: true },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="p-6 rounded-2xl bg-card border border-border relative overflow-hidden"
    >
      {/* Subtle accent stripe */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary/40" />

      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <CalendarCheck className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h3 className="font-display text-base font-semibold text-foreground">
            Bloom Weekly Review
          </h3>
          <p className="text-xs text-muted-foreground">Your week at a glance</p>
        </div>
      </div>

      {/* Summary grid */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {summaryItems.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.3 + i * 0.1 }}
            className="rounded-xl bg-muted/50 p-3 text-center"
          >
            <item.icon className="w-4 h-4 mx-auto mb-1 text-primary" />
            <p className="text-xs text-muted-foreground">{item.label}</p>
            <p className="text-sm font-semibold text-foreground">{item.value}</p>
          </motion.div>
        ))}
      </div>

      {/* XP reward section */}
      <AnimatePresence mode="wait">
        {!completed ? (
          <motion.div
            key="action"
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Zap className="w-3.5 h-3.5 text-accent" />
              <span>+{xpReward} XP on completion</span>
            </div>
            <Button
              size="sm"
              variant="hero"
              className="rounded-full text-xs px-4"
              onClick={() => setCompleted(true)}
            >
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              Complete Review
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between rounded-xl bg-primary/5 border border-primary/10 p-3"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">
                Weekly Review Complete
              </span>
            </div>
            <span className="text-sm font-bold text-primary">+{xpReward} XP</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default WeeklyCheckIn;
