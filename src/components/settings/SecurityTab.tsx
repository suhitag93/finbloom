import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Lock, Eye, Trash2, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const SecurityTab = () => {
  const { signOut } = useAuth();

  const securityFeatures = [
    { icon: Lock, label: "Bank-level 256-bit encryption", active: true },
    { icon: Eye, label: "Read-only access to accounts", active: true },
    { icon: ShieldCheck, label: "Credentials never stored on device", active: true },
    { icon: Trash2, label: "Data can be deleted anytime", active: true },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" /> Security & Privacy
          </CardTitle>
          <CardDescription>Your data is protected with industry-standard security</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {securityFeatures.map((f, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
              <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="text-sm text-foreground">{f.label}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle className="text-lg text-destructive">Danger Zone</CardTitle>
          <CardDescription>These actions are irreversible</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10" onClick={signOut}>
            Sign Out of All Sessions
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityTab;
