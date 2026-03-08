import { Link, useLocation } from "react-router-dom";
import { Sprout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const location = useLocation();
  const isLanding = location.pathname === "/";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-sage flex items-center justify-center">
            <Sprout className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-semibold text-foreground">FinBloom</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {isLanding ? (
            <>
              <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</a>
              <a href="#stages" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Growth Stages</a>
              <a href="#about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">About</a>
            </>
          ) : (
            <>
              <Link to="/dashboard" className={cn("text-sm font-medium transition-colors", location.pathname === "/dashboard" ? "text-foreground" : "text-muted-foreground hover:text-foreground")}>Dashboard</Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          {isLanding ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/dashboard">Log in</Link>
              </Button>
              <Button variant="hero" size="sm" asChild>
                <Link to="/dashboard">Get Started</Link>
              </Button>
            </>
          ) : (
            <Button variant="ghost" size="sm" asChild>
              <Link to="/">Home</Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
