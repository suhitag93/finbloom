import { User, Link2, Target, Shield, ChevronRight, LogOut } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useXP } from "@/hooks/useXP";
import { useAuth } from "@/hooks/useAuth";
import DemoBanner from "@/components/DemoBanner";
import { useState } from "react";
import ProfileTab from "@/components/settings/ProfileTab";
import ConnectedAccountsTab from "@/components/settings/ConnectedAccountsTab";
import GoalsBucketsTab from "@/components/settings/GoalsBucketsTab";
import SecurityTab from "@/components/settings/SecurityTab";
import { motion, AnimatePresence } from "framer-motion";

const settingsItems = [
  { id: "profile", label: "Edit Profile", icon: User },
  { id: "accounts", label: "Connected Accounts", icon: Link2 },
  { id: "goals", label: "Goals & Buckets", icon: Target },
  { id: "security", label: "Security & Privacy", icon: Shield },
];

const Profile = () => {
  const { profile, firstName } = useProfile();
  const { currentLevel, totalXP } = useXP();
  const { signOut } = useAuth();
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const renderSection = () => {
    switch (activeSection) {
      case "profile": return <ProfileTab />;
      case "accounts": return <ConnectedAccountsTab />;
      case "goals": return <GoalsBucketsTab />;
      case "security": return <SecurityTab />;
      default: return null;
    }
  };

  return (
    <>
      <DemoBanner />
      <div className="px-4 py-4">
        <AnimatePresence mode="wait">
          {activeSection ? (
            <motion.div
              key="section"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <button
                onClick={() => setActiveSection(null)}
                className="flex items-center gap-1 text-sm text-primary font-medium mb-4 min-h-[44px]"
              >
                ← Back
              </button>
              {renderSection()}
            </motion.div>
          ) : (
            <motion.div
              key="main"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              {/* Header with avatar */}
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-sage flex items-center justify-center text-2xl text-primary-foreground mb-3">
                  {currentLevel.emoji}
                </div>
                <h1 className="font-display text-xl font-semibold text-foreground">{firstName || "Your Profile"}</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {currentLevel.title} • {totalXP.toLocaleString()} XP
                </p>
              </div>

              {/* Settings list */}
              <div className="rounded-2xl bg-card border border-border/50 overflow-hidden">
                {settingsItems.map((item, i) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`flex items-center gap-3 w-full px-4 min-h-[52px] text-left transition-colors hover:bg-secondary/30 ${
                      i < settingsItems.length - 1 ? "border-b border-border/30" : ""
                    }`}
                  >
                    <item.icon className="w-5 h-5 text-muted-foreground shrink-0" />
                    <span className="flex-1 text-sm font-medium text-foreground">{item.label}</span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                  </button>
                ))}
              </div>

              {/* Sign out */}
              <button
                onClick={signOut}
                className="flex items-center gap-3 w-full px-4 min-h-[52px] mt-4 rounded-2xl bg-card border border-border/50 text-destructive hover:bg-destructive/5 transition-colors"
              >
                <LogOut className="w-5 h-5 shrink-0" />
                <span className="text-sm font-medium">Sign Out</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default Profile;
