import { useState, useCallback } from "react";
import { usePlaidLink, PlaidLinkOptions } from "react-plaid-link";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAnalytics } from "@/hooks/useAnalytics";

export const usePlaid = (onSuccess?: () => void) => {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const createLinkToken = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { data, error } = await supabase.functions.invoke("plaid-create-link-token", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (error) throw error;
      if (data?.link_token) {
        setLinkToken(data.link_token);
      } else {
        throw new Error("No link token returned");
      }
    } catch (err) {
      console.error("Failed to create link token:", err);
      toast.error("Failed to initialize bank connection");
    } finally {
      setLoading(false);
    }
  }, []);

  const handlePlaidSuccess = useCallback(async (publicToken: string, metadata: any) => {
    setSyncing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      // Exchange public token
      const { data: exchangeData, error: exchangeError } = await supabase.functions.invoke("plaid-exchange", {
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: { public_token: publicToken },
      });

      if (exchangeError) throw exchangeError;

      // Fetch and store all financial data
      const { data: fetchResult, error: fetchError } = await supabase.functions.invoke("plaid-fetch-data", {
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: { item_id: exchangeData.item_id },
      });

      if (fetchError) throw fetchError;

      toast.success(`Connected ${metadata?.institution?.name || "bank"}! ${fetchResult?.accounts_synced || 0} accounts synced 🌱 +150 XP`);
      onSuccess?.();
    } catch (err) {
      console.error("Plaid connection failed:", err);
      toast.error("Failed to connect bank account");
    } finally {
      setSyncing(false);
      setLinkToken(null);
    }
  }, [onSuccess]);

  const config: PlaidLinkOptions = {
    token: linkToken,
    onSuccess: handlePlaidSuccess,
    onExit: () => setLinkToken(null),
  };

  const { open, ready } = usePlaidLink(config);

  const startPlaidLink = useCallback(async () => {
    if (linkToken && ready) {
      open();
    } else {
      await createLinkToken();
    }
  }, [linkToken, ready, open, createLinkToken]);

  // Auto-open when token is ready
  const openWhenReady = useCallback(() => {
    if (linkToken && ready) {
      open();
    }
  }, [linkToken, ready, open]);

  return {
    startPlaidLink,
    openWhenReady,
    loading,
    syncing,
    ready: !!linkToken && ready,
    linkToken,
  };
};
