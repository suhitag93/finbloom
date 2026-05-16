import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

const DemoLoginOverlay = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[100] bg-background/95 flex flex-col items-center justify-center gap-4"
  >
    <motion.div
      animate={{ scale: [1, 1.1, 1] }}
      transition={{ duration: 1.5, repeat: Infinity }}
      className="text-5xl"
    >
      🌱
    </motion.div>
    <Loader2 className="w-6 h-6 text-primary animate-spin" />
    <p className="font-display text-lg text-foreground font-medium">
      Loading your demo account…
    </p>
  </motion.div>
);

export default DemoLoginOverlay;
