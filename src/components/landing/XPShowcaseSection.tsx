import { motion } from "framer-motion";
import { Zap, Target, Trophy, TrendingUp } from "lucide-react";

const xpActions = [
  { action: "Connect bank accounts", xp: 200, icon: TrendingUp },
  { action: "Complete weekly mission", xp: 75, icon: Target },
  { action: "Save $100", xp: 40, icon: Zap },
  { action: "Start investing", xp: 250, icon: Trophy },
];

const XPShowcaseSection = () => {
  return (
    <section id="how-it-works" className="py-24 px-4">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold-light text-success-foreground text-sm font-medium mb-4">
            <Zap className="w-4 h-4" />
            Earn XP for real money moves
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-4">
            Level up your financial life
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Every smart financial decision earns XP. No points for just opening the app — only for actions that truly grow your wealth.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {xpActions.map((item, i) => (
            <motion.div
              key={item.action}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group relative p-6 rounded-2xl bg-card shadow-card border border-border/50 hover:shadow-soft hover:border-primary/20 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-gold-light text-success-foreground text-xs font-bold">
                +{item.xp} XP
              </div>
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-4 group-hover:bg-gradient-sage group-hover:text-primary-foreground transition-all duration-300">
                <item.icon className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground">{item.action}</h3>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default XPShowcaseSection;
