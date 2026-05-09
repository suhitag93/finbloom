# Supabase Edge Function Secrets

Edge function secrets are stored in your Supabase project — never in the repo.

Set them via the Supabase dashboard under **Project Settings → Edge Functions → Secrets**,
or via the CLI:

```bash
supabase secrets set KEY=value
supabase secrets set KEY1=value1 KEY2=value2   # multiple at once
```

---

## Required secrets

| Secret | Where to get it | Notes |
|---|---|---|
| `PLAID_CLIENT_ID` | Plaid dashboard → Team → Keys | Same value for sandbox and production |
| `PLAID_SECRET` | Plaid dashboard → Team → Keys | **Different** for sandbox vs production |
| `PLAID_BASE_URL` | — | `https://sandbox.plaid.com` or `https://production.plaid.com` |
| `DEMO_USER_PASSWORD` | You choose | Password for the `demo@growwithfinbloom.com` seed account |

> **`SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`** are
> automatically injected by Supabase into every edge function at runtime.
> You do not need to set them manually.

---

## Switching Plaid sandbox → production

1. Log into [dashboard.plaid.com](https://dashboard.plaid.com) and get your **production** `client_id` and `secret` (these differ from sandbox credentials).
2. Update secrets in your Supabase project:
   ```bash
   supabase secrets set PLAID_CLIENT_ID=<prod-client-id>
   supabase secrets set PLAID_SECRET=<prod-secret>
   supabase secrets set PLAID_BASE_URL=https://production.plaid.com
   ```
3. Redeploy all edge functions:
   ```bash
   supabase functions deploy plaid-create-link-token
   supabase functions deploy plaid-exchange
   supabase functions deploy plaid-fetch-data
   ```

No code changes are needed — `PLAID_BASE_URL` is read at runtime.

---

## Moving to a new Supabase project

1. Create a new project at [supabase.com/dashboard](https://supabase.com/dashboard).
2. Run all migrations against the new project:
   ```bash
   supabase db push --project-ref <new-project-ref>
   ```
3. Update `.env` (or your CI/CD env vars):
   ```
   VITE_SUPABASE_URL=https://<new-project-ref>.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=<new-anon-key>
   VITE_SUPABASE_PROJECT_ID=<new-project-ref>
   ```
4. Update `supabase/config.toml`:
   ```toml
   project_id = "<new-project-ref>"
   ```
5. Re-set all edge function secrets in the new project (see table above).
6. Update the Google OAuth callback URL in [Google Cloud Console](https://console.cloud.google.com):
   - Go to APIs & Services → Credentials → your OAuth 2.0 client
   - Add `https://<new-project-ref>.supabase.co/auth/v1/callback` to **Authorized redirect URIs**

---

## Deploying to Netlify or Vercel

Both platforms support Vite out of the box. Set the frontend env vars
(`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`)
in the platform's environment variable settings. The `netlify.toml` and
`vercel.json` in the repo root handle SPA routing automatically.
