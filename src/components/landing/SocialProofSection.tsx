import { motion } from "framer-motion";

const quotes = [
  {
    text: "Finally an app that doesn't make me feel bad about my spending.",
    author: "Early tester",
    bg: "bg-lavender-light",
  },
  {
    text: "I checked my account balance for the first time in months. And it felt okay.",
    author: "Early tester",
    bg: "bg-secondary",
  },
  {
    text: "The streak feature actually works. I've checked in 12 days in a row.",
    author: "Early tester",
    bg: "bg-lavender-light",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

const SocialProofSection = () => (
  <section className="py-20 px-4 bg-secondary/40">
    <div className="container mx-auto">
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="font-display text-3xl md:text-4xl font-semibold text-primary text-center mb-12"
      >
        Women are already blooming 🌱
      </motion.h2>

      <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {quotes.map((q, i) => (
          <motion.blockquote
            key={i}
            custom={i}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className={`rounded-2xl border border-border/50 ${q.bg} p-8 shadow-card`}
          >
            <p className="text-foreground text-base leading-relaxed italic mb-4">
              "{q.text}"
            </p>
            <cite className="text-muted-foreground text-sm not-italic">— {q.author}</cite>
          </motion.blockquote>
        ))}
      </div>
    </div>
  </section>
);

export default SocialProofSection;
