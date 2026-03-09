import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Heart, Zap, Sprout, BookOpen } from "lucide-react";

interface AccordionSection {
  id: string;
  label: string;
  emoji: string;
  icon: React.ElementType;
  children: React.ReactNode;
}

interface Props {
  sections: AccordionSection[];
}

const MobileDashboardAccordion = ({ sections }: Props) => {
  // First section open by default
  const [openIds, setOpenIds] = useState<string[]>([sections[0]?.id ?? ""]);

  const toggle = (id: string) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="flex flex-col gap-3 md:hidden">
      {sections.map((section) => {
        const isOpen = openIds.includes(section.id);
        const Icon = section.icon;
        return (
          <div
            key={section.id}
            className="rounded-2xl border border-border/50 bg-card shadow-sm overflow-hidden"
          >
            {/* Header */}
            <button
              onClick={() => toggle(section.id)}
              className="flex items-center gap-3 w-full px-4 py-3.5 text-left transition-colors hover:bg-secondary/40"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-primary/10">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <span className="flex-1 text-sm font-semibold text-foreground">
                {section.emoji} {section.label}
              </span>
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.25 }}
              >
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </motion.div>
            </button>

            {/* Content */}
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 space-y-4">
                    {section.children}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};

export { MobileDashboardAccordion };
export type { AccordionSection };
