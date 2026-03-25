import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import heroBotanical from "@/assets/hero-botanical.png";

const HeroSection = () => {
  return (
    <>
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-warm" />
        {/* Floating garden particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {["🌱", "🌸", "🌿", "✨", "🍃"].map((emoji, i) => (
            <motion.span
              key={i}
              className="absolute text-2xl opacity-20"
              style={{ left: `${15 + i * 18}%`, top: `${20 + (i % 3) * 25}%` }}
              animate={{ y: [0, -15, 0], rotate: [0, 10, -10, 0] }}
              transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut" }}
            >
              {emoji}
            </motion.span>
          ))}
        </div>

        <div className="container mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <div className="uppercase tracking-widest text-sm font-body font-medium text-[hsl(134,16%,55%)] mb-6">
                For women who want to feel better about money
              </div>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-[hsl(0,0%,17%)] leading-[1.15] mb-6">
                Financial confidence starts with feeling safe enough to look.
              </h1>
              <p className="text-base font-body text-[hsl(0,0%,40%)] max-w-[480px] mb-8 leading-relaxed">
                finBloom is a financial wellness app built around your relationship with money — not just your numbers. We're building it right now, and we want your voice to shape it.
              </p>
              <div className="flex flex-col items-start gap-3">
                <Link
                  to="/survey"
                  className="inline-flex items-center gap-2 rounded-full bg-[hsl(43,60%,54%)] px-8 py-4 font-body font-bold text-white hover:bg-[hsl(43,60%,46%)] hover:scale-105 transition-all duration-200 text-base"
                >
                  🌱 Take the 5-minute survey — help us build this
                </Link>
                <p className="text-sm font-body text-[hsl(0,0%,40%)]">
                  Completely anonymous · 5 minutes · Your answers shape what gets built
                </p>
                <Link
                  to="/auth?demo=true"
                  className="text-sm font-body text-muted-foreground underline underline-offset-2 hover:text-primary transition-colors mt-2"
                >
                  🌿 Or explore the app first
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="relative hidden lg:block"
            >
              <div className="relative">
                <div className="absolute -inset-4 bg-primary/5 rounded-3xl blur-2xl" />
                <img
                  src={heroBotanical}
                  alt="FinBloom financial growth garden illustration"
                  className="relative rounded-2xl w-full max-w-lg mx-auto animate-float"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
};

export default HeroSection;
