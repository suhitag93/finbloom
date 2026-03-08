import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, RefreshCw, Trash2, Building2, TrendingUp, CreditCard, Landmark, PiggyBank, Wallet } from "lucide-react";
import { motion } from "framer-motion";
import { useAccounts, type Institution } from "@/hooks/useAccounts";
import { toast } from "sonner";

const ACCOUNT_TYPE_ICONS: Record<string, React.ReactNode> = {
  checking: <Wallet className="w-4 h-4" />,
  savings: <PiggyBank className="w-4 h-4" />,
  credit_card: <CreditCard className="w-4 h-4" />,
  investment: <TrendingUp className="w-4 h-4" />,
  retirement: <Landmark className="w-4 h-4" />,
  loan: <Building2 className="w-4 h-4" />,
};

const MOCK_ACCOUNT_PRESETS: Record<string, { nickname: string; account_type: string; balance: number }[]> = {
  "Marcus by Goldman Sachs": [{ nickname: "Emergency Savings", account_type: "savings", balance: 8400 }],
  "Chase": [{ nickname: "Checking", account_type: "checking", balance: 3200 }, { nickname: "Freedom Credit Card", account_type: "credit_card", balance: -1450 }],
  "Vanguard": [{ nickname: "Brokerage", account_type: "investment", balance: 15200 }, { nickname: "Roth IRA", account_type: "retirement", balance: 24200 }],
  "Fidelity": [{ nickname: "401(k)", account_type: "retirement", balance: 32500 }],
  "Bank of America": [{ nickname: "Checking", account_type: "checking", balance: 2100 }, { nickname: "Savings", account_type: "savings", balance: 5600 }],
  "Capital One": [{ nickname: "Venture Card", account_type: "credit_card", balance: -820 }],
  "Robinhood": [{ nickname: "Individual Account", account_type: "investment", balance: 4800 }],
  "Schwab": [{ nickname: "Brokerage", account_type: "investment", balance: 18700 }],
};

const ConnectedAccountsTab = () => {
  const { accounts, institutions, loading, connectInstitution, addManualAccount, deleteAccount, refreshAccount } = useAccounts();
  const [showConnect, setShowConnect] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [manualForm, setManualForm] = useState({ nickname: "", account_type: "checking", balance: "" });

  // Group accounts by institution
  const grouped = accounts.reduce<Record<string, typeof accounts>>((acc, a) => {
    const key = a.institution?.name || "Manual";
    if (!acc[key]) acc[key] = [];
    acc[key].push(a);
    return acc;
  }, {});

  const connectedInstitutionIds = new Set(accounts.map((a) => a.institution_id));
  const availableInstitutions = institutions.filter((i) => !connectedInstitutionIds.has(i.id));

  const handleConnect = async (inst: Institution) => {
    setConnecting(inst.id);
    // Simulate Plaid connection delay
    await new Promise((r) => setTimeout(r, 1500));
    const presets = MOCK_ACCOUNT_PRESETS[inst.name] || [{ nickname: "Account", account_type: "checking", balance: 1000 }];
    await connectInstitution(inst.id, presets);
    setConnecting(null);
    toast.success(`Connected ${inst.name}! +150 XP 🌱`);
  };

  const handleAddManual = async () => {
    if (!manualForm.nickname || !manualForm.balance) return;
    // Use first institution as fallback for manual
    const manualInst = institutions[0];
    if (!manualInst) return;
    await addManualAccount({
      nickname: manualForm.nickname,
      account_type: manualForm.account_type,
      balance: parseFloat(manualForm.balance),
      institution_id: manualInst.id,
    });
    setManualForm({ nickname: "", account_type: "checking", balance: "" });
    setShowManual(false);
    toast.success("Manual account added!");
  };

  const handleRefresh = async (accountId: string) => {
    await refreshAccount(accountId);
    toast.success("Account synced!");
  };

  if (loading) return <div className="text-muted-foreground text-sm py-8 text-center">Loading accounts…</div>;

  return (
    <div className="space-y-6">
      {/* Header actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-semibold text-foreground">Connected Institutions</h2>
          <p className="text-muted-foreground text-sm">{accounts.length} account{accounts.length !== 1 ? "s" : ""} across {Object.keys(grouped).length} institution{Object.keys(grouped).length !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowManual(true)}>
            <Plus className="w-3.5 h-3.5 mr-1" /> Manual
          </Button>
          <Button variant="hero" size="sm" onClick={() => setShowConnect(true)}>
            <Plus className="w-3.5 h-3.5 mr-1" /> Connect Account
          </Button>
        </div>
      </div>

      {/* Connected accounts grouped by institution */}
      {Object.keys(grouped).length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Building2 className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground font-medium mb-1">No accounts connected yet</p>
            <p className="text-muted-foreground text-sm mb-4">Connect your bank or investment accounts to start tracking</p>
            <Button variant="hero" size="sm" onClick={() => setShowConnect(true)}>
              <Plus className="w-3.5 h-3.5 mr-1" /> Connect Your First Account
            </Button>
          </CardContent>
        </Card>
      ) : (
        Object.entries(grouped).map(([instName, accts]) => (
          <motion.div key={instName} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{accts[0]?.institution?.logo_url || "🏦"}</span>
                    <CardTitle className="text-base">{instName}</CardTitle>
                    <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">Connected</Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Last synced: {accts[0]?.last_synced_at ? new Date(accts[0].last_synced_at).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "Never"}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {accts.map((account) => (
                  <div key={account.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        {ACCOUNT_TYPE_ICONS[account.account_type] || <Wallet className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{account.nickname}</p>
                        <p className="text-xs text-muted-foreground capitalize">{account.account_type.replace("_", " ")}{account.is_manual ? " · Manual" : ""}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-semibold ${account.balance < 0 ? "text-destructive" : "text-foreground"}`}>
                        {account.balance < 0 ? "-" : ""}${Math.abs(account.balance).toLocaleString()}
                      </span>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleRefresh(account.id)}>
                        <RefreshCw className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive/70 hover:text-destructive" onClick={() => { deleteAccount(account.id); toast.success("Account removed"); }}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        ))
      )}

      {/* Connect Institution Dialog */}
      <Dialog open={showConnect} onOpenChange={setShowConnect}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Connect Financial Account</DialogTitle>
            <DialogDescription>Select an institution to securely connect via read-only access</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {availableInstitutions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">All available institutions are already connected!</p>
            ) : (
              availableInstitutions.map((inst) => (
                <button
                  key={inst.id}
                  onClick={() => handleConnect(inst)}
                  disabled={connecting === inst.id}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/40 hover:bg-primary/5 transition-all text-left disabled:opacity-60"
                >
                  <span className="text-2xl">{inst.logo_url}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{inst.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{inst.institution_type}</p>
                  </div>
                  {connecting === inst.id ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-primary" />
                  ) : (
                    <Plus className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Manual Account Dialog */}
      <Dialog open={showManual} onOpenChange={setShowManual}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Add Manual Account</DialogTitle>
            <DialogDescription>Track an account that doesn't support API connections</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Account Name</Label>
              <Input placeholder="e.g. RSU Equity" value={manualForm.nickname} onChange={(e) => setManualForm((p) => ({ ...p, nickname: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Account Type</Label>
              <Select value={manualForm.account_type} onValueChange={(v) => setManualForm((p) => ({ ...p, account_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["checking", "savings", "credit_card", "investment", "retirement", "loan", "mortgage", "crypto", "other"].map((t) => (
                    <SelectItem key={t} value={t}>{t.replace("_", " ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Balance ($)</Label>
              <Input type="number" placeholder="0.00" value={manualForm.balance} onChange={(e) => setManualForm((p) => ({ ...p, balance: e.target.value }))} />
            </div>
            <Button variant="hero" className="w-full" onClick={handleAddManual} disabled={!manualForm.nickname || !manualForm.balance}>
              Add Account
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ConnectedAccountsTab;
