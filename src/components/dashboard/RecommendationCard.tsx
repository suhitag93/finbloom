import { motion } from "framer-motion";
import { ArrowRight, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import FinancialDisclaimer from "@/components/FinancialDisclaimer";

const recommendations = [
  {
    title: "Start a Roth IRA",
    description: "Contributing $200/month could grow to $180k+ by retirement age.",
    tag: "Investing",
  },
  {
    title: "Increase 401k to 10%",
    description: "You're currently contributing 6%. Increasing to 10% maximizes your employer match.",
    tag: "Retirement",
  },
  {
    title: "Automate emergency savings",
    description: "Set up a $150 weekly auto-transfer to reach your goal 3 months sooner.",
    tag: "Savings",
  },
];

const RecommendationCard = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="p-6 rounded-2xl bg-card shadow-card border border-border/50"
    >
      <div className="flex items-center gap-2 mb-5">
        <Compass className="w-5 h-5 text-primary" />
        <h3 className="font-display text-lg font-semibold text-foreground">Recommended Next Steps</h3>
      </div>

      <div className="space-y-3">
        {recommendations.map((rec, i) => (
          <motion.div
            key={rec.title}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.6 + i * 0.08 }}
            className="group flex items-start gap-3 p-4 rounded-xl bg-secondary/30 border border-border/30 hover:border-primary/30 hover:bg-secondary/50 transition-all cursor-pointer"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-foreground">{rec.title}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                  {rec.tag}
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{rec.description}</p>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors mt-1 shrink-0" />
          </motion.div>
        ))}
      </div>
      <FinancialDisclaimer />
    </motion.div>
  );
};

export default RecommendationCard;
