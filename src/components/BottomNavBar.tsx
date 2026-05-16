import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Home, Target, Lightbulb, User, Flower2 } from "lucide-react";
import SageChatDrawer from "@/components/sage/SageChatDrawer";

const tabs = [
  { id: "home", label: "Home", icon: Home, path: "/dashboard" },
  { id: "missions", label: "Missions", icon: Target, path: "/missions" },
  { id: "sage", label: "Sage", icon: Flower2, path: null }, // center button
  { id: "insights", label: "Insights", icon: Lightbulb, path: "/insights" },
  { id: "profile", label: "Profile", icon: User, path: "/profile" },
];

const BottomNavBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sageOpen, setSageOpen] = useState(false);

  return (
    <>
      <nav
        className="shrink-0 border-t bg-[hsl(var(--bottom-nav))] border-[hsl(var(--bottom-nav-border))]"
        style={{
          height: 72,
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        <div className="flex items-center justify-around h-full px-2">
          {tabs.map((tab) => {
            if (tab.id === "sage") {
              return (
                <button
                  key={tab.id}
                  onClick={() => setSageOpen(true)}
                  className="flex flex-col items-center justify-center gap-0.5 flex-1 min-h-[44px] min-w-[44px] py-1 -mt-3"
                  aria-label="Sage"
                >
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center shadow-md"
                    style={{ background: "#9B89B0" }}
                  >
                    <Flower2 size={22} strokeWidth={1.5} className="text-white" fill="none" />
                  </div>
                  <span className="text-[10px] leading-tight font-semibold" style={{ color: "#9B89B0" }}>
                    Sage
                  </span>
                </button>
              );
            }

            const isActive = location.pathname === tab.path;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => tab.path && navigate(tab.path)}
                className="flex flex-col items-center justify-center gap-0.5 flex-1 min-h-[44px] min-w-[44px] py-1 transition-colors"
                aria-label={tab.label}
              >
                <Icon
                  size={22}
                  strokeWidth={1.5}
                  className={isActive ? "text-primary" : "text-muted-foreground"}
                  fill="none"
                />
                <span
                  className={`text-[10px] leading-tight ${
                    isActive
                      ? "text-primary font-semibold"
                      : "text-muted-foreground"
                  }`}
                >
                  {tab.label}
                </span>
                {isActive && (
                  <span className="w-1 h-1 rounded-full bg-primary mt-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      <SageChatDrawer open={sageOpen} onClose={() => setSageOpen(false)} />
    </>
  );
};

export default BottomNavBar;
