import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Sparkles, ArrowRight } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-24 px-4">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl bg-gradient-sage p-12 md:p-16 text-center"
        >
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-success rounded-full blur-3xl" />
          </div>
          {/* Floating emojis */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {["🌱", "🌸", "🌿", "🌺"].map((e, i) => (
              <motion.span
                key={i}
                className="absolute text-3xl opacity-15"
                style={{ left: `${10 + i * 25}%`, top: `${15 + (i % 2) * 55}%` }}
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3 + i, repeat: Infinity }}
              >
                {e}
              </motion.span>
            ))}
          </div>

          <div className="relative z-10">
            <Sparkles className="w-8 h-8 text-primary-foreground/80 mx-auto mb-4" />
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-primary-foreground mb-4">
              Ready to shape the future of financial wellness?
            </h2>
            <p className="text-primary-foreground/80 text-lg max-w-xl mx-auto mb-8">
              Your voice matters. Help us build the app that finally gets personal finance right.
            </p>
            <Link
              to="/survey"
              className="inline-flex items-center gap-2 rounded-full bg-[hsl(43,60%,54%)] px-8 py-4 font-body font-bold text-white hover:bg-[hsl(43,60%,46%)] hover:scale-105 transition-all duration-200 text-base"
            >
              🌱 Take the Survey <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
