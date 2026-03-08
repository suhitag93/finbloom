import { Sprout } from "lucide-react";

const FooterSection = () => (
  <footer id="about" className="py-12 px-4 border-t border-border/50">
    <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-md bg-gradient-sage flex items-center justify-center">
          <Sprout className="w-4 h-4 text-primary-foreground" />
        </div>
        <span className="font-display text-sm font-semibold text-foreground">FinBloom</span>
      </div>
      <p className="text-sm text-muted-foreground">
        © 2026 FinBloom. Grow into financial confidence.
      </p>
    </div>
  </footer>
);

export default FooterSection;
