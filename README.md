# finBloom 🌱

**Grow your wealth, one habit at a time.**

finBloom is a gamified personal finance app built for women who want to build a healthier relationship with money. Users earn XP for real financial behaviours — connecting accounts, hitting savings milestones, paying down debt, completing weekly missions — and progress through six growth levels from Seed to Legacy.

---

## Features

### Core product
- **Financial health score** — a single 0–100 score across spending balance, emergency savings, debt health, and investing
- **Net worth tracking** — live view of assets and liabilities across all connected accounts
- **Goal tracker** — set financial goals, link them to accounts, and watch progress visually
- **Savings buckets** — ring-fence money toward specific goals inside the app
- **Spending overview** — categorised transaction view with Recharts visualisations
- **Monthly reports** — auto-generated summaries of the month's financial activity
- **Smart alerts** — surfaced anomalies and recommendations based on account data

### Gamification
- **XP system** — earn points for real money actions (not just logging in): connecting a bank (+200 XP), setting a goal (+50 XP), starting investing (+250 XP), maintaining streaks, and more
- **Six growth levels** — Seed → Sprout → Bloom → Thrive → Flourish → Legacy (0 / 500 / 1,500 / 4,000 / 8,000 / 15,000 XP)
- **Streak multipliers** — 3-day (1.1×), 7-day (1.2×), 30-day (1.5×)
- **Weekly missions** — action-oriented challenges with XP rewards
- **Achievement badges** — 15+ badges across savings, debt, investing, and engagement categories
- **Level progression map** — visual journey from current level to the next

### Onboarding
- 8-step personalised setup: personal info → demographics → financial profile → bank connection → health score → goals → gamified level reveal
- Computes starting level (Seed → Thrive) from accounts held and financial confidence

### Research survey
- 18-question pre-launch survey capturing mindset, money journey, demographics, and product motivation
- Auto-saves to `localStorage`; submits anonymously to Supabase
- Captures email for waitlist opt-in

### Banking integration
- Plaid-powered bank and investment account connection
- Transaction sync, categorisation, investment holdings, and liability tracking

### Auth & security
- Email/password and Google OAuth via Supabase Auth
- Row-Level Security on every table — users can only access their own data
- XP computed server-side via `SECURITY DEFINER` functions to prevent client manipulation
- Immutable XP ledger for full audit trail

### Demo mode
- Pre-seeded demo personas for product exploration without sign-up
- Timed conversion prompts and demo banner

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite |
| Routing | React Router DOM v6 |
| Styling | Tailwind CSS + Shadcn/UI + Radix UI |
| Animation | Framer Motion |
| Charts | Recharts |
| Forms | React Hook Form + Zod |
| Data fetching | TanStack React Query |
| Backend / DB | Supabase (PostgreSQL + Auth + RLS) |
| Banking | Plaid (react-plaid-link) |
| Analytics | PostHog |
| Icons | Lucide React |

---

## Running locally

**Prerequisites:** Node.js 18+ and npm (install via [nvm](https://github.com/nvm-sh/nvm))

```sh
# 1. Clone the repo
git clone <YOUR_GIT_URL>
cd growwithfinbloom

# 2. Install dependencies
npm install

# 3. Add environment variables (see section below)
cp .env.example .env
# fill in your values

# 4. Start the dev server
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Environment variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<your-supabase-anon-key>
VITE_SUPABASE_PROJECT_ID=<your-project-ref>

# Optional — disables analytics if omitted
VITE_POSTHOG_KEY=<your-posthog-key>
```

Find your Supabase values in **Project Settings → API** inside the [Supabase dashboard](https://supabase.com/dashboard).

---

## Database setup

The `supabase/migrations/` folder contains all migrations in order. Apply them with:

```sh
# Using the Supabase CLI
supabase db push
```

Or paste each `.sql` file into the **SQL Editor** in your Supabase dashboard.

**Tables created:**

| Table | Purpose |
|---|---|
| `profiles` | User profile, demographics, level, XP, financial score |
| `xp_ledger` | Immutable audit log of every XP transaction |
| `missions` | Available weekly missions (reference data) |
| `user_missions` | Per-user mission progress |
| `achievements` | Available badges (reference data) |
| `user_achievements` | Earned badges per user |
| `accounts` | Connected bank/investment accounts |
| `institutions` | Bank/institution reference data |
| `transactions` | Synced bank transactions |
| `investment_holdings` | Investment positions |
| `liabilities` | Debt accounts |
| `goals` | User financial goals |
| `goal_milestones` | Goal progress milestones |
| `plaid_connections` | Plaid OAuth tokens |
| `waitlist` | Pre-launch email list |
| `survey_responses` | Anonymous survey submissions |

---

## Project structure

```
src/
├── pages/            # Route-level components (Landing, Auth, Onboarding, Dashboard, Settings, Survey)
├── components/
│   ├── dashboard/    # All dashboard widgets and cards
│   ├── landing/      # Landing page sections
│   ├── onboarding/   # 8-step onboarding components
│   ├── settings/     # Settings tabs
│   └── ui/           # Shadcn/UI base components
├── integrations/
│   └── supabase/     # Supabase client and generated types
└── hooks/            # Shared React hooks
supabase/
└── migrations/       # Database migration SQL files
```

---

## Deploying

This project is built and hosted on [Lovable](https://lovable.dev). To publish:

1. Open the project in Lovable
2. Click **Share → Publish**

To connect a custom domain: **Project → Settings → Domains → Connect Domain**

---

## Editing the code

**Via Lovable:** prompt directly in the Lovable editor — changes commit automatically.

**Via local IDE:** clone the repo, make changes, and push. Lovable picks up pushed changes from the connected GitHub repo.

**Via GitHub:** edit files directly in the GitHub UI and commit.
