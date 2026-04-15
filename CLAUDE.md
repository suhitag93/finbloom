# CLAUDE.md — finBloom Standing Context

This file is loaded automatically at the start of every AI-assisted development session. Read it fully before making any changes.

---

## 1. Product Overview

**finBloom** (`growwithfinbloom`) is a gamified personal finance app for women — focused on rebuilding the emotional relationship with money alongside practical financial behaviour change. Users connect bank accounts via Plaid, earn XP for healthy financial actions, progress through six growth levels (Seed → Legacy), and receive emotionally-calibrated coaching from **Sage**, finBloom's AI financial coach. The app is deployed on the Lovable.dev platform as a client-side SPA.

---

## 2. Tech Stack

| Layer | Library / Tool | Version |
|---|---|---|
| UI framework | React | 18.3.1 |
| Language | TypeScript | 5.8.3 |
| Build tool | Vite (SWC) | 5.4.19 |
| Routing | React Router DOM | 6.30.1 |
| Server state | TanStack Query | 5.83.0 |
| Styling | Tailwind CSS | 3.4.17 |
| Component library | shadcn/ui (Radix UI) | default style, CSS variables |
| Animation | Framer Motion | 12.35.1 |
| Charts | Recharts | 2.15.4 |
| Forms | React Hook Form + Zod | 7.61.1 / 3.25.76 |
| Backend / DB / Auth | Supabase JS | 2.98.0 |
| Banking data | Plaid (react-plaid-link) | 4.1.1 — **sandbox mode** |
| AI gateway | Lovable AI Gateway → Gemini 3 Flash Preview | via `LOVABLE_API_KEY` |
| Edge functions runtime | Deno (Supabase Functions) | — |
| Analytics | PostHog | 1.360.1 (optional) |
| Testing | Vitest + Testing Library | 3.2.4 / 16.0.0 |
| Platform auth | @lovable.dev/cloud-auth-js | 1.0.0 |
| Lovable editor | lovable-tagger (dev) | 1.1.13 |

No React Server Components. Pure client-side SPA.

---

## 3. Repository Structure

```
growwithfinbloom/
├── src/
│   ├── main.tsx                    # App entry; PostHog init
│   ├── App.tsx                     # Router, MobileAppShell, ProtectedRoute
│   ├── index.css                   # CSS variables (all brand tokens), base styles
│   ├── pages/                      # Route-level components (one per route)
│   │   ├── LandingPage.tsx
│   │   ├── Auth.tsx
│   │   ├── Onboarding.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Missions.tsx
│   │   ├── Insights.tsx
│   │   ├── Profile.tsx
│   │   └── Survey.tsx
│   ├── components/
│   │   ├── dashboard/              # 19 dashboard widgets
│   │   ├── onboarding/             # 8 onboarding step components
│   │   ├── landing/                # Landing page sections
│   │   ├── settings/               # Profile/goals/accounts tabs
│   │   ├── sage/                   # SageChatDrawer.tsx
│   │   └── ui/                     # shadcn/ui base components (do not edit)
│   ├── hooks/                      # ALL data logic lives here
│   │   ├── useAuth.tsx             # Auth context + session
│   │   ├── useProfile.tsx          # Profile CRUD
│   │   ├── useFinancialData.tsx    # Accounts + net worth
│   │   ├── useFinancialHealthStates.tsx  # Health score calculation
│   │   ├── useGoals.tsx            # Goals CRUD
│   │   ├── useMissions.tsx         # Missions + XP completion
│   │   ├── useXP.tsx               # XP ledger + level reads
│   │   ├── useAccounts.tsx         # Bank accounts
│   │   ├── usePlaid.tsx            # Plaid link flow
│   │   ├── useAnalytics.tsx        # PostHog wrapper
│   │   ├── use-mobile.tsx          # Breakpoint detection
│   │   └── use-toast.ts            # Sonner toast wrapper
│   ├── lib/
│   │   ├── xp-system.ts            # LEVELS[], XP_ACTIONS[], getLevelForXP()
│   │   ├── demo-constants.ts       # DEMO_EMAIL constant
│   │   ├── demo-profiles.ts        # Pre-seeded demo personas (large)
│   │   └── utils.ts                # cn() and general helpers
│   └── integrations/
│       └── supabase/
│           ├── client.ts           # Supabase client (singleton)
│           └── types.ts            # Auto-generated DB types (do not edit)
├── supabase/
│   ├── config.toml                 # Project config; JWT bypass list for demo/plaid
│   ├── functions/                  # Deno edge functions
│   │   ├── sage-chat/              # Sage AI coach (streaming)
│   │   ├── plaid-create-link-token/
│   │   ├── plaid-exchange/
│   │   ├── plaid-fetch-data/
│   │   ├── seed-demo-account/
│   │   ├── reset-demo-account/
│   │   └── demo-login/
│   └── migrations/                 # 22 ordered SQL migrations (source of truth for schema)
├── docs/
│   └── sage-lavender-paper-draft.md  # Architecture design rationale — READ BEFORE changing agent logic
├── tailwind.config.ts              # Brand color tokens + custom animations
├── components.json                 # shadcn/ui CLI config
└── vitest.config.ts
```

---

## 4. Routing Map

| Path | Protection | Shell | Notes |
|---|---|---|---|
| `/` | Public (redirects → /dashboard if authed) | Navbar | LandingPage |
| `/survey` | Public | Navbar | Pre-registration research survey |
| `/auth` | Public | None | Email/password + Google OAuth |
| `/onboarding` | Protected | None | 8-step onboarding flow |
| `/dashboard` | Protected | MobileAppShell | Main app home |
| `/missions` | Protected | MobileAppShell | Missions + XP |
| `/insights` | Protected | MobileAppShell | Sage + spending insights |
| `/profile` | Protected | MobileAppShell | Profile + settings tabs |
| `/settings` | — | — | Redirects to `/profile` |

**MobileAppShell** (`src/App.tsx:37`) = DemoBanner + scrollable content + BottomNavBar. Applied only to the four main app routes. The shell uses `height: 100dvh` with `-webkit-overflow-scrolling: touch`.

---

## 5. Multi-Agent Architecture

> Full design rationale: `docs/sage-lavender-paper-draft.md`

The system is built around two AI reasoning agents with strictly bounded domains. They **must not share context windows**.

### Sage — Emotional Intelligence Layer
- **Domain**: User's psychological relationship with money
- **Data it reads**: `user_context`, `profiles`, `conversations`, `knowledge_base`
- **Data it never touches**: `transactions`, `accounts`, `investment_holdings`, `liabilities`
- **Implementation**: `supabase/functions/sage-chat/index.ts` — streaming Deno function
- **Model**: Google Gemini 3 Flash Preview via Lovable AI Gateway
- **Rate limit**: 20 calls/day per user, tracked in `root_state.sage_calls_today`
- **System prompt hard limits** (enforced in `sage-chat`):
  - Max 60 words per response
  - One question or CTA per reply; never two
  - No financial jargon without inline definition
  - Never recommend a specific product, broker, or external service
  - Never diagnose or treat anxiety
  - Redirect off-topic queries: "That's a bit outside my lane"

### Lavender — Analytical/Behavioral Layer
- **Domain**: Active financial behaviour — transaction patterns, savings velocity, goal congruence, spending grammar
- **Data it reads**: `transactions`, `accounts`, `investment_holdings`, `liabilities`, `goals`
- **Data it never touches**: `user_context`, `conversations`
- **Implementation status**: **Not yet built as an edge function.** The data infrastructure (Plaid sync tables) is in place. When building Lavender, create a new edge function `lavender-analyze/` that reads only the banking tables.

### Root — Orchestration Layer
- **Domain**: Synthesizes Sage (emotional) + Lavender (analytical) to decide what to surface (mission / insight / check-in / alert / silence)
- **Partial implementation**: `root_state` table tracks per-user Sage rate-limit state. Full orchestration decision logic is **not yet built**.
- **Design principle**: Root must be a structured decision function (rules + weights), not a free-form LLM, to remain auditable and conservative.

### Grove
- **Status**: Conceptual only. Not yet designed or implemented.

### Privacy Firewall — MUST NOT be collapsed
```
Sage  ──reads──► user_context, profiles, conversations, knowledge_base
                 ✗ NEVER reads transactions, accounts, holdings, liabilities

Lavender ─reads─► transactions, accounts, investment_holdings, liabilities, goals
                  ✗ NEVER reads user_context, conversations
```
This separation is **architectural**, not cosmetic. Collapsing it would compromise the emotional safety of the product. Enforce it at the query level in each function.

---

## 6. Database Schema

Supabase project: `wxpifygevyofkkankgtu`. Migrations are the source of truth — `supabase/migrations/`.
Auto-generated TypeScript types: `src/integrations/supabase/types.ts` (do not edit manually).

### User Core
| Table | Key Columns | Notes |
|---|---|---|
| `profiles` | user_id, full_name, age, income_range, employment_status, household_size, financial_confidence, financial_personality, finbloom_level, xp_points, financial_score, goals[], connected_bank | Auto-created on auth signup via trigger. `xp_points`, `finbloom_level`, `financial_score` are **computed — never write directly** |
| `user_context` | user_id (unique), financial_stage, primary_goal, money_feeling[], onboarding_answers (jsonb), persona_type | Sage's qualitative profile. persona_type: avoider / aspirational_learner / financially_delegated / rebuilder / unknown |

### Banking (Plaid-synced)
| Table | Key Columns | Notes |
|---|---|---|
| `institutions` | name, provider, logo_url, institution_type | 8 rows pre-seeded in migrations |
| `accounts` | user_id, institution_id, nickname, account_type, balance, is_manual, last_synced_at | account_type: checking/savings/credit_card/retirement/investment/loan |
| `transactions` | user_id, account_id, amount, date, merchant_name, category, subcategory, pending, plaid_transaction_id | Unique on plaid_transaction_id |
| `investment_holdings` | user_id, account_id, symbol, name, quantity, current_value, cost_basis, plaid_security_id | |
| `liabilities` | user_id, account_id, liability_type, balance, minimum_payment, apr | liability_type: credit_card / student_loan |
| `plaid_connections` | user_id, access_token, item_id | **SELECT revoked from authenticated role** — only readable server-side via service_role |

### Goals
| Table | Key Columns | Notes |
|---|---|---|
| `goals` | user_id, title, goal_type, target_amount, current_amount, status, linked_account_id, monthly_contribution, target_date, coach_notes | status: active / inactive |
| `goal_milestones` | goal_id, user_id, milestone_pct, reached_at, xp_awarded | |
| `goal_accounts` | goal_id, account_id | Many-to-many |

### Gamification
| Table | Key Columns | Notes |
|---|---|---|
| `xp_ledger` | user_id, xp_amount, source_type, source_id (UUID), reason, created_at | **Immutable audit log.** Users can SELECT only. All writes via `award_xp()` |
| `missions` | title, description, mission_type, difficulty, xp_reward, is_active | Read-only for authenticated users |
| `user_missions` | user_id, mission_id, progress_value, completed, started_at, completed_at | Unique(user_id, mission_id) |
| `achievements` | name, description, xp_reward, badge_icon, category | Read-only for authenticated users |
| `user_achievements` | user_id, achievement_id, earned_at | Unique(user_id, achievement_id) |

### Sage / AI
| Table | Key Columns | Notes |
|---|---|---|
| `conversations` | user_id, role (user/assistant), content, created_at | Full Sage chat history |
| `knowledge_base` | content, embedding (pgvector 1536), search_vector (tsvector), category, title | Full-text search via `match_knowledge()` RPC |
| `root_state` | user_id (unique), sage_calls_today, sage_reset_date | Sage daily rate limit tracking |

### Pre-auth / Research
| Table | Notes |
|---|---|
| `survey_responses` | Public insert (no auth). 18-question pre-launch research survey |
| `waitlist` | Public insert (no auth). Email capture |

---

## 7. Security Architecture

### Row-Level Security
- Every user-owned table enforces `auth.uid() = user_id`
- `knowledge_base`, `missions`, `achievements`, `institutions` — authenticated read, no write
- `survey_responses`, `waitlist` — public insert, no auth required

### Column-Level Protection (computed fields)
These columns are REVOKED from the authenticated role and may only be written via SECURITY DEFINER functions:
- `profiles.xp_points`
- `profiles.finbloom_level`
- `profiles.financial_score`

**Never** call `supabase.from('profiles').update({ xp_points: ... })` from the client or an edge function using the anon key. It will silently fail or be blocked.

### XP Award Pattern
All XP must go through the `award_xp()` database function:
```sql
SELECT award_xp(
  p_user_id     := '<uuid>',
  p_xp_amount   := 100,
  p_source_type := 'mission_completed',   -- must be in whitelist
  p_source_id   := '<idempotency-uuid>',  -- required; prevents double-award
  p_reason      := 'Completed Save $50 mission'
);
```
Allowed `source_type` values: `mission_completed`, `achievement_earned`, `goal_milestone`, `goal_created`, `bank_connected`, `onboarding_completed`, `onboarding`, `banking`, `engagement`, `streak_bonus`, `weekly_review`, `saving`.

From the client: `supabase.rpc('award_xp', { p_user_id, p_xp_amount, p_source_type, p_source_id, p_reason })`.

### Plaid Access Token
`plaid_connections.access_token` is **never returned to the client**. The `plaid-exchange` function stores it using the service_role key. The `plaid-fetch-data` function reads it using the service_role key. Authenticated users have SELECT revoked on this table. Do not add SELECT back.

### Edge Function Auth Pattern
```typescript
// User-scoped client → verify identity
const supabaseUser = createClient(url, anonKey, {
  global: { headers: { Authorization: authHeader } }
});
const { data: { user } } = await supabaseUser.auth.getUser();

// Service client → privileged DB reads (bypasses RLS)
const supabase = createClient(url, serviceRoleKey);
```

---

## 8. XP & Gamification System

Defined in `src/lib/xp-system.ts`. Database enforces the same thresholds inside `award_xp()`.

### Growth Levels
| ID | Title | XP Required | Focus |
|---|---|---|---|
| 0 | Seed | 0 | Financial awareness |
| 1 | Sprout | 500 | Budget control |
| 2 | Bloom | 1,500 | Saving habits |
| 3 | Thrive | 4,000 | Investing |
| 4 | Flourish | 8,000 | Wealth building |
| 5 | Legacy | 15,000 | Advanced wealth strategy |

### Key XP Actions
| Action | XP | source_type |
|---|---|---|
| Complete onboarding | 100 | `onboarding_completed` |
| Connect bank | 200 | `bank_connected` |
| Complete weekly mission | 75 | `mission_completed` |
| Set financial goals | 50 | `goal_created` |
| Start investing | 250 | `engagement` |

**Design principle**: XP rewards real financial behaviour, not app engagement (no XP for simply opening the app or chatting with Sage).

---

## 9. Brand Tokens & Design System

### CSS Variables (defined in `src/index.css`)
```css
--primary:            152 22% 58%   /* Sage green */
--accent:             245 30% 73%   /* Lavender purple */
--background:         36  33% 96%   /* Warm cream */
--card:               36  33% 98%
--success:            43  87% 62%   /* Gold */
--destructive:        0   65% 55%   /* Red */
--muted-foreground:   200 10% 46%
--radius:             0.75rem

/* Extended tokens */
--sage-light:         152 20% 95%
--sage-dark:          152 25% 35%
--lavender-light:     245 30% 95%
--cream-dark:         36  20% 90%
--gold-light:         43  87% 90%
```

### Tailwind Color Names
```
text-primary / bg-primary          → Sage green
text-accent  / bg-accent           → Lavender
bg-background                      → Warm cream
text-success / bg-success          → Gold
bg-sage-light, text-sage-dark      → Sage variants
bg-lavender-light                  → Lavender tint
bg-cream-dark                      → Cream variant
bg-gold-light                      → Gold tint
```

### Gradients (utility classes defined in `src/index.css`)
```
bg-gradient-sage    → sage green → deeper sage
bg-gradient-bloom   → sage → lavender
bg-gradient-warm    → cream top → slightly darker cream
bg-gradient-gold    → gold → amber
text-gradient-sage  → text clipped to sage gradient
text-gradient-bloom → text clipped to bloom gradient
```

### Shadows
```
shadow-soft    → subtle sage-tinted shadow
shadow-card    → neutral card shadow
shadow-glow    → sage green glow
```

### Typography
- **Display / Headings**: `font-display` → Fraunces (serif, optical size variable font). Applied globally to `h1–h6` in base styles.
- **Body**: `font-body` → DM Sans (sans-serif). Applied to `body`.
- Base font size: `14px`

### Animation Classes (Tailwind keyframes)
```
animate-fade-up        0.6s ease-out
animate-fade-in        0.5s ease-out
animate-scale-in       0.3s ease-out
animate-grow           0.8s ease-out (scaleY from bottom)
animate-pulse-soft     3s infinite (opacity 1→0.7)
animate-float          4s infinite (translateY 0→-8px)
animate-sage-drawer-up 380ms cubic-bezier(0.32,0.72,0,1) — Sage chat sheet
```

### Mobile-Specific Utilities
```
pb-safe          → env(safe-area-inset-bottom, 16px)
scrollbar-hide   → hides scrollbar cross-browser
sage-cursor      → blinking cursor for Sage streaming
```

---

## 10. Patterns & Conventions

### Data Fetching — Hooks First
All Supabase queries live in `src/hooks/`. Pages and components receive data via props or hook calls — never call `supabase` directly inside a component. Use TanStack Query (`useQuery`, `useMutation`) for caching and invalidation.

### Supabase Client
Singleton at `src/integrations/supabase/client.ts`. Import as:
```typescript
import { supabase } from "@/integrations/supabase/client";
```
Always scope queries to `auth.uid()` — rely on RLS, but also filter explicitly:
```typescript
supabase.from("accounts").select("*").eq("user_id", user.id)
```

### Form Pattern
React Hook Form + Zod resolver. Validation schemas live co-located with the form component or in a sibling `schema.ts` file.

### shadcn/ui Components
All base UI primitives are in `src/components/ui/`. **Do not edit files in this directory** — they are managed by the shadcn/ui CLI. Customise by wrapping, not modifying. Add new shadcn components with `npx shadcn@latest add <component>`.

### Demo Mode
- Demo user email: `demo@growwithfinbloom.com` (from `src/lib/demo-constants.ts`)
- Demo functions (`demo-login`, `seed-demo-account`, `reset-demo-account`) have `verify_jwt = false` in `supabase/config.toml`
- `DemoBanner` and `DemoConversionPrompts` components detect the demo user and surface upgrade prompts
- Demo personas defined in `src/lib/demo-profiles.ts`

### Lovable-Specific Patterns
- `lovable-tagger` (dev only) adds `data-lovable-id` attributes — do not remove
- Components are wired to the Lovable visual editor; do not rename or restructure component files without being aware of editor references
- AI calls go through `https://ai.gateway.lovable.dev/v1/chat/completions` using `LOVABLE_API_KEY`

### Edge Function Structure
Each function at `supabase/functions/<name>/index.ts` follows this pattern:
1. Handle OPTIONS preflight (CORS)
2. Validate Authorization header
3. Create user-scoped client → verify identity
4. Create service-role client → privileged queries
5. Validate request body
6. Business logic
7. Return JSON or streaming response

CORS headers are defined inline in each function (`corsHeaders` constant).

### Mobile App Shell
Authenticated routes (`/dashboard`, `/missions`, `/insights`, `/profile`) are wrapped in `MobileAppShell` in `src/App.tsx`. The shell is a fixed-height flex column (`100dvh`) with scrollable content and a sticky `BottomNavBar`. Do not add `position: fixed` or full-height wrappers inside pages — it will fight the shell layout.

---

## 11. Environment Variables

### Frontend (Vite — prefix `VITE_`)
| Variable | Purpose |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/public key |
| `VITE_SUPABASE_PROJECT_ID` | Project ID (used to build function URLs) |
| `VITE_POSTHOG_KEY` | PostHog analytics key (optional) |

### Edge Functions (Supabase secrets)
| Variable | Purpose |
|---|---|
| `SUPABASE_URL` | Supabase URL (auto-injected by platform) |
| `SUPABASE_ANON_KEY` | Anon key (auto-injected) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key — bypasses RLS |
| `PLAID_CLIENT_ID` | Plaid API client ID |
| `PLAID_SECRET` | Plaid API secret (sandbox) |
| `LOVABLE_API_KEY` | Lovable AI Gateway key (for `sage-chat`) |
| `DEMO_USER_PASSWORD` | Password for demo@growwithfinbloom.com |

**Plaid environment** is hardcoded to `https://sandbox.plaid.com` in all three Plaid functions. Change to `https://production.plaid.com` for production launch.

---

## 12. What NOT To Do

### Never collapse the Sage/Lavender privacy firewall
- Do not add transaction queries to `sage-chat`
- Do not add `user_context` or `conversations` queries to any future Lavender function
- Do not build a "unified context" agent that reads both domains simultaneously — this is an explicit architectural decision, not an oversight

### Never reference internal agent names to users
The `sage-chat` system prompt enforces: **"Never reference Lavender, Root, Grove, or any internal system name."** Do not add UI copy, error messages, or logging that surfaces these names to end users.

### Never write computed profile fields directly
Do not call `supabase.from('profiles').update({ xp_points, finbloom_level, financial_score })` from anywhere — frontend or edge functions. Always use `award_xp()` for XP. `financial_score` is updated by `recalculate_financial_score()`. These columns have a column-level REVOKE; direct writes will silently fail.

### Never expose `plaid_connections` to the client
Do not add SELECT grants back to the `plaid_connections` table for the authenticated role. The access_token must remain server-side only.

### Never allow duplicate XP awards
Every call to `award_xp()` must pass a unique, deterministic `p_source_id` (UUID). Reusing the same source_id + source_type combination is idempotent by design — the function will skip re-awarding. Do not omit `source_id` or generate random UUIDs on every call.

### Never add XP for engagement-only actions
XP rewards real financial behaviour (connecting accounts, reaching savings goals, completing missions with financial impact). Do not award XP for: opening the app, chatting with Sage, navigating between tabs, or dismissing notifications.

### Never edit `src/components/ui/` files
These are managed by the shadcn/ui CLI. Wrap and extend instead.

### Never edit `src/integrations/supabase/types.ts` manually
This file is auto-generated from the Supabase schema. Regenerate it with `npx supabase gen types typescript --project-id wxpifygevyofkkankgtu > src/integrations/supabase/types.ts` after schema changes.

### Never skip RLS on new tables
Every new table that stores user data must have RLS enabled with a `auth.uid() = user_id` policy. Use the migration files as the template.

### Never add `position: fixed` inside authenticated pages
Pages render inside `MobileAppShell`'s scrollable container. Fixed positioning breaks the mobile scroll model. Use sticky instead, or hoist elements to the shell.

### Never hardcode the Supabase project URL or keys in source code
Always read from `import.meta.env.VITE_*` on the frontend and `Deno.env.get()` in edge functions.

---

## 13. Development Commands

```bash
npm run dev          # Start dev server (localhost:8080)
npm run build        # Production build
npm run test         # Run Vitest once
npm run test:watch   # Vitest watch mode
npm run smoke        # Run smoke tests
npm run lint         # ESLint
```

For Supabase local development:
```bash
npx supabase start                          # Start local Supabase stack
npx supabase functions serve sage-chat      # Serve single edge function locally
npx supabase db reset                       # Reset + re-run all migrations
npx supabase gen types typescript \
  --project-id wxpifygevyofkkankgtu \
  > src/integrations/supabase/types.ts      # Regenerate DB types after schema changes
```
