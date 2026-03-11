import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, RefreshCw, Trash2, Building2, TrendingUp, CreditCard, Landmark, PiggyBank, Wallet, Loader2, Unlink } from "lucide-react";
import { motion } from "framer-motion";
import { useAccounts } from "@/hooks/useAccounts";
import { usePlaid } from "@/hooks/usePlaid";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ACCOUNT_TYPE_ICONS: Record<string, React.ReactNode> = {
  checking: <Wallet className="w-4 h-4" />,
  savings: <PiggyBank className="w-4 h-4" />,
  credit_card: <CreditCard className="w-4 h-4" />,
  investment: <TrendingUp className="w-4 h-4" />,
  retirement: <Landmark className="w-4 h-4" />,
  loan: <Building2 className="w-4 h-4" />,
};

const ConnectedAccountsTab = () => {
  const { accounts, institutions, loading, refetch, addManualAccount, deleteAccount, refreshAccount } = useAccounts();
  const { startPlaidLink, openWhenReady, loading: plaidLoading, syncing, ready: plaidReady, linkToken } = usePlaid(() => refetch());
  const { user, isDemoUser } = useAuth();
  const [showManual, setShowManual] = useState(false);
  const [disconnectTarget, setDisconnectTarget] = useState<{ instName: string; instId: string; accountIds: string[] } | null>(null);
  const [manualForm, setManualForm] = useState({ nickname: "", account_type: "checking", balance: "" });

  const guardDemo = (action: string) => {
    if (isDemoUser) {
      toast.error(`This is demo data — connect your real accounts to ${action} 💚`);
      return true;
    }
    return false;
  };

  // Auto-open Plaid Link when token becomes ready
  useEffect(() => {
    if (plaidReady) openWhenReady();
  }, [plaidReady, openWhenReady]);

  // Group accounts by institution
  const grouped = accounts.reduce<Record<string, typeof accounts>>((acc, a) => {
    const key = a.institution?.name || "Manual";
    if (!acc[key]) acc[key] = [];
    acc[key].push(a);
    return acc;
  }, {});

  const handleAddManual = async () => {
    if (guardDemo("add accounts")) return;
    if (!manualForm.nickname || !manualForm.balance) return;
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

  const handleDisconnectInstitution = async () => {
    if (guardDemo("disconnect institutions")) return;
    if (!disconnectTarget || !user) return;
    const { instName, instId, accountIds } = disconnectTarget;

    for (const id of accountIds) {
      await supabase.from("accounts").delete().eq("id", id);
    }

    await supabase.from("plaid_connections").delete().eq("user_id", user.id);

    const { data: remaining } = await supabase.from("accounts").select("id").eq("user_id", user.id).limit(1);
    if (!remaining || remaining.length === 0) {
      await supabase.from("profiles").update({ connected_bank: false }).eq("user_id", user.id);
    }

    setDisconnectTarget(null);
    toast.success(`${instName} disconnected successfully`);
    await refetch();
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
          <Button variant="hero" size="sm" onClick={startPlaidLink} disabled={plaidLoading || syncing}>
            {plaidLoading || syncing ? (
              <><Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> {syncing ? "Syncing…" : "Connecting…"}</>
            ) : (
              <><Plus className="w-3.5 h-3.5 mr-1" /> Connect Bank</>
            )}
          </Button>
        </div>
      </div>

      {/* Syncing overlay */}
      {syncing && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="py-6 text-center">
            <Loader2 className="w-8 h-8 mx-auto text-primary animate-spin mb-3" />
            <p className="text-foreground font-medium">Syncing your accounts…</p>
            <p className="text-muted-foreground text-sm">Fetching accounts, transactions, investments, and liabilities</p>
          </CardContent>
        </Card>
      )}

      {/* Connected accounts grouped by institution */}
      {Object.keys(grouped).length === 0 && !syncing ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Building2 className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground font-medium mb-1">No accounts connected yet</p>
            <p className="text-muted-foreground text-sm mb-4">Connect your bank or investment accounts via Plaid</p>
            <Button variant="hero" size="sm" onClick={startPlaidLink} disabled={plaidLoading}>
              {plaidLoading ? (
                <><Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> Initializing…</>
              ) : (
                <><Plus className="w-3.5 h-3.5 mr-1" /> Connect Your First Account</>
              )}
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
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive/70 hover:text-destructive hover:bg-destructive/10 ml-1 h-7 px-2 text-xs"
                      onClick={() => setDisconnectTarget({
                        instName,
                        instId: accts[0]?.institution_id || "",
                        accountIds: accts.map(a => a.id),
                      })}
                    >
                      <Unlink className="w-3 h-3 mr-1" /> Disconnect
                    </Button>
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
      {/* Disconnect Confirmation Dialog */}
      <AlertDialog open={!!disconnectTarget} onOpenChange={(open) => !open && setDisconnectTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disconnect {disconnectTarget?.instName}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove all {disconnectTarget?.accountIds.length} connected account{(disconnectTarget?.accountIds.length || 0) !== 1 ? "s" : ""} and stop syncing.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDisconnectInstitution} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Disconnect
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ConnectedAccountsTab;
