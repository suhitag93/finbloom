import { motion } from "framer-motion";

const cards = [
  {
    emoji: "🌱",
    title: "Meets you where you are",
    body: "No judgment. No jargon. Just a warm, encouraging space to tend to your money at your own pace.",
    bg: "bg-secondary",
  },
  {
    emoji: "⚡",
    title: "Small actions, real progress",
    body: "Daily micro-missions that take 60 seconds and actually move the needle on your goals.",
    bg: "bg-lavender-light",
  },
  {
    emoji: "💚",
    title: "Celebrates your wins",
    body: "Every milestone matters. From your first savings deposit to hitting your emergency fund goal — finBloom sees your progress.",
    bg: "bg-secondary",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.5 },
  }),
};

const FeelsLikeSection = () => (
  <section className="py-20 px-4">
    <div className="container mx-auto">
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="font-display text-3xl md:text-4xl font-semibold text-accent text-center mb-12"
      >
        What finBloom feels like
      </motion.h2>

      <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {cards.map((c, i) => (
          <motion.div
            key={c.title}
            custom={i}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className={`rounded-2xl border border-border/50 ${c.bg} p-8 text-center shadow-card`}
          >
            <span className="text-4xl mb-4 block">{c.emoji}</span>
            <h3 className="font-display text-lg font-semibold text-foreground mb-3">
              {c.title}
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{c.body}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default FeelsLikeSection;
