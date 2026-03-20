import { Link, useLocation } from "react-router-dom";
import { LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import FinBloomIcon from "@/components/FinBloomIcon";

const Navbar = () => {
  const location = useLocation();
  const isLanding = location.pathname === "/";
  const { user, signOut } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2 group">
           <FinBloomIcon size="lg" />
           <span className="font-display text-xl font-semibold text-foreground">FinBloom</span>
         </Link>

        <div className="hidden md:flex items-center gap-8">
          {isLanding ? (
            <>
              <a href="#about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">About</a>
              <Link to="/survey" className="text-sm font-medium text-[hsl(134,16%,55%)] hover:text-foreground transition-colors">Take the Survey</Link>
            </>
          ) : (
            <>
              <Link to="/dashboard" className={cn("text-sm font-medium transition-colors", location.pathname === "/dashboard" ? "text-foreground" : "text-muted-foreground hover:text-foreground")}>Dashboard</Link>
              <Link to="/settings" className={cn("text-sm font-medium transition-colors", location.pathname === "/settings" ? "text-foreground" : "text-muted-foreground hover:text-foreground")}>Settings</Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          {isLanding && !user ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/auth">Log in</Link>
              </Button>
              <Button variant="hero" size="sm" asChild>
                <Link to="/auth">Get Started</Link>
              </Button>
            </>
          ) : user ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/dashboard">Dashboard</Link>
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                <Link to="/settings"><Settings className="w-4 h-4" /></Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={signOut}>
                <LogOut className="w-4 h-4 mr-1" />
                Sign out
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
