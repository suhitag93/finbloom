import { useEffect, useRef } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/hooks/useAuth";
import FinBloomIcon from "@/components/FinBloomIcon";
import {
  LayoutDashboard,
  Heart,
  Shield,
  Landmark,
  CreditCard,
  TrendingUp,
  Target,
  Lightbulb,
  Trophy,
  Settings,
  LogOut,
  X,
} from "lucide-react";

interface MobileNavDrawerProps {
  open: boolean;
  onClose: () => void;
}

const navSections = [
  {
    label: "Dashboard",
    items: [
      { title: "Overview", url: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Financial Health",
    items: [
      { title: "Scorecards", url: "/dashboard#health", icon: Heart },
      { title: "Emergency Fund", url: "/dashboard#goals", icon: Shield },
      { title: "Debt Health", url: "/dashboard#networth", icon: Landmark },
      { title: "Spending", url: "/dashboard#spending", icon: CreditCard },
      { title: "Investments", url: "/dashboard#networth", icon: TrendingUp },
    ],
  },
  {
    label: "",
    items: [
      { title: "Goals", url: "/dashboard#goals", icon: Target },
      { title: "Insights", url: "/dashboard#coaching", icon: Lightbulb },
      { title: "Achievements", url: "/dashboard#achievements", icon: Trophy },
    ],
  },
];

const MobileNavDrawer = ({ open, onClose }: MobileNavDrawerProps) => {
  const { signOut } = useAuth();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x < -80 || info.velocity.x < -300) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            ref={drawerRef}
            className="fixed top-0 left-0 bottom-0 z-50 w-[80vw] max-w-[320px] bg-background border-r border-border/50 shadow-2xl flex flex-col"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 350 }}
            drag="x"
            dragConstraints={{ left: -320, right: 0 }}
            dragElastic={0.1}
            onDragEnd={handleDragEnd}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/50">
              <div className="flex items-center gap-2.5">
                <FinBloomIcon size="lg" />
                <span className="font-display text-lg font-semibold text-foreground">
                  FinBloom
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Nav sections */}
            <nav className="flex-1 overflow-y-auto py-3 px-3">
              {navSections.map((section, si) => (
                <div key={si} className="mb-4">
                  {section.label && (
                    <p className="text-[11px] uppercase tracking-wider font-medium text-muted-foreground px-3 mb-2">
                      {section.label}
                    </p>
                  )}
                  <div className="space-y-0.5">
                    {section.items.map((item) => (
                      <NavLink
                        key={item.title}
                        to={item.url}
                        end
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-foreground/80 hover:bg-secondary/60 transition-colors"
                        activeClassName="bg-primary/10 text-primary font-medium"
                        onClick={onClose}
                      >
                        <item.icon className="w-4 h-4 shrink-0" />
                        <span>{item.title}</span>
                      </NavLink>
                    ))}
                  </div>
                </div>
              ))}
            </nav>

            {/* Footer */}
            <div className="border-t border-border/50 p-3 space-y-0.5">
              <NavLink
                to="/settings"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-foreground/80 hover:bg-secondary/60 transition-colors"
                activeClassName="bg-primary/10 text-primary font-medium"
                onClick={onClose}
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </NavLink>
              <button
                onClick={() => {
                  onClose();
                  signOut();
                }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-foreground/80 hover:bg-destructive/10 transition-colors w-full"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign out</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileNavDrawer;
