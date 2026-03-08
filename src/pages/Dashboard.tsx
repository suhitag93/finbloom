import { motion } from "framer-motion";
import { Sprout, TrendingUp, Wallet, PiggyBank, ArrowUpRight, ArrowDownRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import GrowthStageCard from "@/components/dashboard/GrowthStageCard";
import HealthScoreCard from "@/components/dashboard/HealthScoreCard";
import NetWorthCard from "@/components/dashboard/NetWorthCard";
import SavingsBuckets from "@/components/dashboard/SavingsBuckets";
import SpendingOverview from "@/components/dashboard/SpendingOverview";
import MilestoneCard from "@/components/dashboard/MilestoneCard";

const Dashboard = () => {
  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-2">
            Good morning, Sarah 🌿
          </h1>
          <p className="text-muted-foreground text-lg">
            Your financial garden is growing beautifully.
          </p>
        </motion.div>

        {/* Top Row */}
        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          <GrowthStageCard />
          <HealthScoreCard />
          <MilestoneCard />
        </div>

        {/* Middle Row */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <NetWorthCard />
          <SpendingOverview />
        </div>

        {/* Bottom Row */}
        <SavingsBuckets />

        {/* AI Insight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-6 p-5 rounded-2xl bg-lavender-light border border-accent/20"
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4 text-accent" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground mb-1">Bloom Guide Insight</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                "Shifting $40 from dining this week would help you reach your emergency fund goal 2 weeks sooner. You're doing amazing — keep it up! 🌸"
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
