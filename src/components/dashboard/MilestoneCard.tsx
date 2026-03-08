import { motion } from "framer-motion";
import { Star, ChevronRight } from "lucide-react";

const MilestoneCard = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.25 }}
      className="p-6 rounded-2xl bg-card shadow-card border border-border/50"
    >
      <h3 className="font-display text-lg font-semibold text-foreground mb-4">Next Milestone</h3>
      <div className="flex items-center gap-3 p-3 rounded-xl bg-gold-light/50 mb-4">
        <div className="w-10 h-10 rounded-lg bg-gradient-gold flex items-center justify-center">
          <Star className="w-5 h-5 text-success-foreground" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">$5,000 Emergency Fund</p>
          <p className="text-xs text-muted-foreground">$1,800 to go</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-2">
        <div className="h-2 rounded-full bg-secondary overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-gold"
            initial={{ width: 0 }}
            animate={{ width: "64%" }}
            transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
          />
        </div>
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>$3,200 saved</span>
        <span>64%</span>
      </div>
    </motion.div>
  );
};

export default MilestoneCard;
