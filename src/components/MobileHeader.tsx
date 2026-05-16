import { useState } from "react";
import { Menu, Bell } from "lucide-react";
import FinBloomIcon from "@/components/FinBloomIcon";
import MobileNavDrawer from "@/components/MobileNavDrawer";

const MobileHeader = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center justify-between h-14 px-4 bg-background/90 backdrop-blur-md border-b border-border/50 md:hidden">
        <button
          onClick={() => setDrawerOpen(true)}
          className="p-2 -ml-2 rounded-xl hover:bg-secondary/60 transition-colors"
          aria-label="Open navigation"
        >
          <Menu className="w-5 h-5 text-foreground" />
        </button>

        <div className="flex items-center gap-1.5">
          <FinBloomIcon size="md" />
          <span className="font-display text-base font-semibold text-foreground">
            FinBloom
          </span>
        </div>

        <button
          className="p-2 -mr-2 rounded-xl hover:bg-secondary/60 transition-colors relative"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5 text-foreground" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
        </button>
      </header>

      <MobileNavDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
};

export default MobileHeader;
