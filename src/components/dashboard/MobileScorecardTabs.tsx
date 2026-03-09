import { useRef } from "react";
import { motion } from "framer-motion";
import { Shield, Landmark, CreditCard, TrendingUp, Target } from "lucide-react";

const tabs = [
  { id: "emergency", label: "Emergency Fund", icon: Shield, emoji: "🛡️" },
  { id: "debt", label: "Debt", icon: Landmark, emoji: "💳" },
  { id: "spending", label: "Spending", icon: CreditCard, emoji: "🛒" },
  { id: "investing", label: "Investing", icon: TrendingUp, emoji: "📈" },
  { id: "goals", label: "Goals", icon: Target, emoji: "🎯" },
];

interface Props {
  activeTab: string;
  onTabChange: (id: string) => void;
}

const MobileScorecardTabs = ({ activeTab, onTabChange }: Props) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className="md:hidden -mx-4 px-4">
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto pb-2 scrollbar-none"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                relative flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium
                whitespace-nowrap transition-colors shrink-0
                ${isActive
                  ? "bg-primary/10 text-primary"
                  : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
                }
              `}
            >
              <span className="text-sm">{tab.emoji}</span>
              <span>{tab.label}</span>
              {isActive && (
                <motion.div
                  layoutId="scorecard-active"
                  className="absolute inset-0 rounded-full border-2 border-primary/30"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MobileScorecardTabs;
