import { motion } from "framer-motion";
import { Sprout, ChevronRight } from "lucide-react";

const stages = [
  { emoji: "🌱", name: "Seed", active: true, completed: true },
  { emoji: "🌿", name: "Sprout", active: true, completed: false },
  { emoji: "🌸", name: "Bloom", active: false, completed: false },
  { emoji: "🌳", name: "Thrive", active: false, completed: false },
];

const GrowthStageCard = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="p-6 rounded-2xl bg-card shadow-card border border-border/50"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg font-semibold text-foreground">Growth Stage</h3>
        <span className="text-2xl">🌿</span>
      </div>
      <p className="text-2xl font-display font-semibold text-primary mb-1">Sprout</p>
      <p className="text-sm text-muted-foreground mb-4">Building financial awareness</p>
      
      {/* Stage Progress */}
      <div className="flex items-center gap-1">
        {stages.map((stage, i) => (
          <div key={stage.name} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                stage.completed
                  ? "bg-primary/20"
                  : stage.active
                  ? "bg-primary/10 ring-2 ring-primary/30"
                  : "bg-muted"
              }`}
            >
              {stage.emoji}
            </div>
            {i < stages.length - 1 && (
              <div className={`w-4 h-0.5 mx-0.5 ${stage.completed ? "bg-primary/40" : "bg-border"}`} />
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default GrowthStageCard;
