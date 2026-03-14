import { motion } from "framer-motion";
import { Sparkles, Lightbulb } from "lucide-react";
import FinancialDisclaimer from "@/components/FinancialDisclaimer";

const insights = [
  "Redirecting $150/month from subscriptions could grow your investments by $85k in 20 years.",
  "You have enough savings for 2.3 months of expenses. Target: 6 months.",
  "Your spending dropped 12% this week — great discipline! 🌿",
];

const WeeklyCoaching = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="p-6 rounded-2xl bg-lavender-light border border-accent/20 h-full flex flex-col"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-accent" />
        </div>
        <div>
          <h3 className="font-display text-base font-semibold text-foreground">Bloom Guide — Weekly Insights</h3>
        </div>
      </div>

      <div className="space-y-3">
        {insights.map((insight, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.6 + i * 0.12 }}
            className="flex items-start gap-2.5"
          >
            <Lightbulb className="w-3.5 h-3.5 text-accent mt-1 shrink-0" />
            <p className="text-sm text-muted-foreground leading-relaxed">{insight}</p>
          </motion.div>
        ))}
      </div>
      <FinancialDisclaimer />
    </motion.div>
  );
};

export default WeeklyCoaching;
