import { motion } from "framer-motion";
import { ALL_BADGES } from "@/lib/xp-system";

const BadgesPreviewSection = () => {
  const previewBadges = ALL_BADGES.slice(0, 8);

  return (
    <section className="py-24 px-4">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-4">
            Collect badges. Build wealth.
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Every financial milestone earns you a badge and bonus XP. How many can you unlock?
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
          {previewBadges.map((badge, i) => (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ scale: 1.05, y: -4 }}
              className="flex flex-col items-center p-4 rounded-2xl bg-card shadow-card border border-border/50 cursor-default"
            >
              <span className="text-3xl mb-2">{badge.emoji}</span>
              <span className="font-display text-sm font-semibold text-foreground text-center leading-tight">
                {badge.title}
              </span>
              <span className="text-xs text-muted-foreground mt-1 text-center">
                {badge.description}
              </span>
              <span className="mt-2 text-xs font-bold text-success">
                +{badge.xpBonus} XP
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BadgesPreviewSection;
