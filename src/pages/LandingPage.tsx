import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Sprout, TrendingUp, PiggyBank, Shield, Sparkles, ArrowRight, Leaf, Star } from "lucide-react";
import heroBotanical from "@/assets/hero-botanical.png";

const features = [
  {
    icon: Sprout,
    title: "Financial Garden",
    description: "Watch your finances grow with a calming dashboard that tracks your progress through growth stages.",
  },
  {
    icon: TrendingUp,
    title: "Smart Spending",
    description: "AI-powered insights help you understand spending patterns without judgment.",
  },
  {
    icon: PiggyBank,
    title: "Savings Buckets",
    description: "Create personalized savings goals that visually fill as you progress toward your dreams.",
  },
  {
    icon: Shield,
    title: "Net Worth Tracker",
    description: "See your complete financial picture with clear asset and liability tracking.",
  },
];

const stages = [
  { emoji: "🌱", name: "Seed", description: "Take a financial snapshot and build your personalized roadmap" },
  { emoji: "🌿", name: "Sprout", description: "Build core awareness — track spending and start saving" },
  { emoji: "🌸", name: "Bloom", description: "Strengthen stability with emergency funds and debt reduction" },
  { emoji: "🌳", name: "Thrive", description: "Grow wealth through investing and financial independence planning" },
];

const LandingPage = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-warm" />
        <div className="container mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground text-sm font-medium mb-6">
                <Leaf className="w-4 h-4" />
                Financial wellness, one step at a time
              </div>
              <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-semibold text-foreground leading-[1.1] mb-6">
                Where your finances{" "}
                <span className="text-gradient-bloom italic">bloom</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-lg mb-8 leading-relaxed">
                Transform financial anxiety into confidence. FinBloom guides you through personalized growth stages — from your first budget to financial independence.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="hero" size="lg" asChild>
                  <Link to="/auth" className="gap-2">
                    Start Growing <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
                <Button variant="hero-outline" size="lg" asChild>
                  <a href="#features">See How It Works</a>
                </Button>
              </div>
              <div className="mt-8 flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex -space-x-2">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full border-2 border-background bg-secondary flex items-center justify-center"
                    >
                      <Star className="w-3 h-3 text-success" />
                    </div>
                  ))}
                </div>
                <span>Join 2,000+ women building financial confidence</span>
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
                  alt="FinBloom financial growth illustration with botanical elements"
                  className="relative rounded-2xl w-full max-w-lg mx-auto animate-float"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-4">
              Everything you need to grow
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Tools designed to feel supportive, not overwhelming. Build financial habits at your own pace.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group p-6 rounded-2xl bg-card shadow-card border border-border/50 hover:shadow-soft hover:border-primary/20 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-4 group-hover:bg-gradient-sage group-hover:text-primary-foreground transition-all duration-300">
                  <feature.icon className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Growth Stages */}
      <section id="stages" className="py-24 px-4 bg-secondary/30">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-4">
              Your growth journey
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Progress through four stages of financial growth — each one unlocking new tools and insights.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stages.map((stage, i) => (
              <motion.div
                key={stage.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="relative p-6 rounded-2xl bg-card shadow-card border border-border/50"
              >
                <div className="text-4xl mb-4">{stage.emoji}</div>
                <h3 className="font-display text-xl font-semibold text-foreground mb-2">{stage.name}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{stage.description}</p>
                {i < stages.length - 1 && (
                  <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 text-muted-foreground/30">
                    <ArrowRight className="w-6 h-6" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-sage p-12 md:p-16 text-center"
          >
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-success rounded-full blur-3xl" />
            </div>
            <div className="relative z-10">
              <Sparkles className="w-8 h-8 text-primary-foreground/80 mx-auto mb-4" />
              <h2 className="font-display text-3xl md:text-4xl font-semibold text-primary-foreground mb-4">
                Ready to bloom?
              </h2>
              <p className="text-primary-foreground/80 text-lg max-w-xl mx-auto mb-8">
                Start your financial growth journey today. It's free to begin, and you'll wonder why you didn't start sooner.
              </p>
              <Button variant="gold" size="lg" asChild>
                <Link to="/auth" className="gap-2">
                  Begin Your Journey <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer id="about" className="py-12 px-4 border-t border-border/50">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-sage flex items-center justify-center">
              <Sprout className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display text-sm font-semibold text-foreground">FinBloom</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 FinBloom. Grow into financial confidence.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
