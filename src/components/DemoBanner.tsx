import { useState } from "react";
import { X, Sparkles, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const DemoBanner = () => {
  const { isDemoUser } = useAuth();
  const [dismissed, setDismissed] = useState(false);

  if (!isDemoUser || dismissed) return null;

  return (
    <div className="sticky top-0 z-50 bg-primary/10 border-b border-primary/20 backdrop-blur-sm">
      <div className="container mx-auto max-w-6xl flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-2 text-sm text-foreground">
          <Sparkles className="w-4 h-4 text-primary shrink-0" />
          <span>
            You're exploring finBloom as <strong>Alex</strong> — this is demo data 💚
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="text-xs h-7 gap-1" asChild>
            <Link to="/#waitlist">Join waitlist</Link>
          </Button>
          <Button variant="hero" size="sm" className="text-xs h-7 gap-1" asChild>
            <Link to="/auth">
              <UserPlus className="w-3 h-3" /> Sign up free
            </Link>
          </Button>
          <button onClick={() => setDismissed(true)} className="text-muted-foreground hover:text-foreground p-1">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DemoBanner;
