# finBloom — Product Brief

**Version:** May 2026 | **Stage:** Pre-Beta | **Founder:** Suhita G.

---

## Vision

Women deserve a financial app that treats them as whole people — not spreadsheet inputs.

finBloom is a gamified personal finance platform that rewards real financial behavior with XP, levels, and missions — without shame, streaks, or punishment. The core thesis: progress compounds when it feels like growth, not grading.

---

## The Problem

Personal finance apps are designed for discipline, not change. They show you what's wrong (overspending, low savings rate, debt) without addressing *why* behavior doesn't change. For women specifically, this creates a compounding problem:

- **Emotional barrier**: Money carries anxiety, shame, and inherited narratives that apps ignore
- **Confidence gap**: 60%+ of women say financial confidence is their #1 barrier to investing
- **Engagement failure**: Most finance apps have <10% 30-day retention — users open, feel judged, leave
- **Personalization gap**: Existing products target a generic user; women's financial journeys differ meaningfully by life stage, household role, income variability, and relationship to money

The result: tools that show the problem but don't help users move through it.

---

## The Solution

finBloom treats financial growth like a garden — something that takes time, care, and the right conditions. It combines:

1. **Behavior-based gamification** — XP for real actions (connecting accounts, hitting savings milestones, paying debt, investing for the first time), not just app logins
2. **Emotionally intelligent AI** — a dual-agent system (Sage + Lavender) that reads both the user's financial data *and* their emotional context, adapting tone and recommendations accordingly
3. **Progressive unlock model** — features reveal as users level up, matching complexity to readiness rather than overwhelming beginners
4. **Shame-free design** — no streak penalties, no red failure states, no comparative benchmarking

---

## Target User

### Primary: Women 25–44, actively building financial stability

**Core persona — "The Aware Builder"**
- Earns $45k–$100k; may have variable income
- Has some savings, limited investing, possibly student debt or credit card balances
- Knows she *should* be doing more but feels overwhelmed by where to start
- Has tried Mint, YNAB, or Personal Capital; abandoned them within 3 months
- Responds to progress, not punishment

**Secondary personas (captured in survey)**
- "The Fresh Start" — under 30, starting from scratch post-college, little financial foundation
- "The Life Changer" — 35–50, navigating a transition (divorce, career change, inheritance, return to work)
- "The Partner in Finance" — currently defers financial decisions to a partner; wants to build her own understanding

---

## Core Feature Set

### Financial Intelligence
| Feature | Description | Status |
|---------|-------------|--------|
| **Financial Health Score** | Single 0–100 score across spending, emergency savings, debt, and investing | Built — hardcoded values to fix |
| **Net Worth Tracker** | Live view of assets minus liabilities across all connected accounts | Live (DB-connected) |
| **Spending Overview** | Categorized transactions with trend charts | Live (DB-connected) |
| **Savings Buckets** | Ringfence money toward specific goals | Built — needs goals table wiring |
| **Goal Tracker** | Set, track, edit, and delete financial goals with visual progress | Live (CRUD complete as of May 2026) |
| **Monthly Reports** | Auto-generated monthly summaries | In design |
| **Smart Alerts** | Anomalies and recommendations surfaced from account data | In design |

### Gamification
| Feature | Description | Status |
|---------|-------------|--------|
| **XP System** | Earn points for real financial actions | Live — award_xp gaps to close |
| **6 Growth Levels** | Seed → Sprout → Bloom → Thrive → Flourish → Legacy | Live |
| **Weekly Missions** | Action-oriented challenges with XP rewards | Display live — completion interaction missing |
| **Achievement Badges** | 15+ badges across savings, debt, investing, engagement | Live |
| **Level Progression** | Visual journey; new features unlock per level | Live |

### Onboarding
8-step personalized setup: Welcome → Personal Info → Demographics → Financial Profile → Bank Connection → Health Score → Goals → Level Reveal

Starting level is computed from: accounts held × financial confidence self-assessment. Users who are just starting get a Seed; users with investments and savings get a higher starting point.

### Research & Personalization
- 18-question pre-launch survey capturing mindset, money journey, income range, accounts held, behavioral patterns, and product motivation
- Survey data feeds Sage's context window (link to user profile — in progress)

### Banking Integration
- Plaid-powered connection for checking, savings, credit, investment, and liability accounts
- Transaction sync, categorization, investment holdings, liability tracking
- Personalized sample data seeding as beta alternative to live Plaid (edge function built)

### Demo Mode
- Pre-seeded demo personas for product exploration without sign-up
- Timed conversion prompts after 3 minutes of exploration

---

## AI Agent Architecture — Sage + Lavender + Root

This is finBloom's core differentiator and the subject of ongoing research publication.

### The Problem with Generic AI Finance Advice
Current AI finance tools are transaction-pattern analyzers dressed as coaches. They miss the psychological layer entirely — *why* someone hasn't started investing despite having $15k in checking, why they avoid looking at their credit card statement, what emotional state they're in when they open the app.

### The Architecture

**Sage** — Emotional Intelligence Agent
- Reads: survey responses, onboarding answers, behavioral patterns, time-of-day, interaction history
- Builds: psychological profile, emotional readiness score, trust level
- Outputs: tone calibration, what *not* to say, when to push vs. hold, metaphor matching
- Think of Sage as the therapist who reads the room before Root speaks

**Lavender** — Financial Analytics Agent
- Reads: transaction data, account balances, goal progress, spending categories, debt levels, investment holdings
- Builds: behavioral model of financial patterns, anomaly detection, opportunity identification
- Outputs: financial insights, goal recommendations, risk signals, progress summaries
- Think of Lavender as the analyst who knows every number

**Root** — Orchestrator
- Receives outputs from Sage and Lavender simultaneously
- Decides: what to surface, when, in what tone, at what depth
- Generates: personalized mission recommendations, coaching messages, weekly summaries, alerts
- The human experience of finBloom *is* Root — Sage and Lavender are invisible to users

**Bloom** *(proposed)*
- Manages missions lifecycle: creation, assignment, progress tracking, completion celebration
- Receives Root's recommendations and converts them to concrete weekly actions
- Closes the loop between AI insight and user behavior

### Why This Works
Most finance apps fail because insight without emotional calibration produces anxiety, not action. Sage ensures Root never surfaces the right insight at the wrong moment. Lavender ensures Root's recommendations are grounded in what's actually happening in the user's accounts. Together they produce advice that is simultaneously financially accurate and emotionally timed.

---

## Gamification Design Principles

**XP rewards financial behavior, not app behavior.**

| Action | XP | Category |
|--------|----|----------|
| Complete onboarding | 100 | Onboarding |
| Connect bank accounts | 200 | Banking |
| Set financial goals | 50 | Onboarding |
| Categorize transactions | 10 | Banking |
| Complete weekly mission | 75 | Engagement |
| Save $100 | 40 | Saving |
| Pay down debt | 50 | Debt |
| Increase savings rate | 100 | Saving |
| Start investing | 250 | Investing |
| Goal milestone (25/50/75/100%) | 50–300 | Goals |

**No streak penalties.** Engagement badges reward consistency (5 check-ins, 10 check-ins) without punishing gaps. A user who comes back after 3 months should feel welcomed, not penalized.

**Level progression unlocks features, not paywalls.** Higher levels reveal more sophisticated tools as users develop the readiness to use them. A beginner at Seed level doesn't need retirement forecasting; a Thrive-level user is ready for it.

---

## Technical Architecture

| Layer | Technology | Notes |
|-------|-----------|-------|
| Frontend | React 18 + TypeScript + Vite | |
| Routing | React Router DOM v6 | |
| Styling | Tailwind CSS + shadcn/ui + Radix UI | Custom botanical design tokens |
| Animation | Framer Motion | Used heavily for level-up, progress, and transitions |
| Charts | Recharts | Spending and net worth visualizations |
| Data fetching | TanStack React Query | |
| Backend | Supabase (PostgreSQL + Auth + RLS) | |
| Edge functions | Deno (Supabase Functions) | Plaid sync, demo seeding, personalized data, AI agents |
| Banking | Plaid (react-plaid-link) | Sandbox for beta |
| Analytics | PostHog | Event tracking, funnel analysis |
| Security | SECURITY DEFINER RPCs | XP computed server-side; immutable ledger |

### Security Model
- Row-Level Security on every table — users access only their own data
- XP awarded exclusively via `award_xp` server-side RPC — client cannot manufacture XP
- Immutable `xp_ledger` table provides full audit trail
- Plaid tokens stored encrypted in `plaid_connections`

---

## Current Development Status

### What's Working
- Full auth flow (email + Google OAuth)
- 8-step onboarding with level computation
- Net worth tracking from real account data
- Transaction sync, spending categorization
- Investment holdings and liability tracking
- Goal CRUD (create, edit, delete, milestone XP)
- XP ledger with level computation
- Achievement badge system
- Weekly missions display
- Demo mode with pre-seeded personas
- Personalized sample data edge function (Plaid alternative for beta)
- Landing page and waitlist capture
- 18-question research survey

### Gaps to Close Before Beta

**Critical** (data integrity)
1. Wire `FinancialHealthSnapshot` to real account data — currently hardcoded
2. Wire `SavingsBuckets` to real goals table — currently hardcoded demo buckets
3. Add `user_id` to `survey_responses` — survey data is orphaned from authenticated profiles
4. Convert onboarding goal selections to actual `goals` table rows on completion
5. Award XP on bank connection (`usePlaid.tsx` — toast promises it, RPC never fires)
6. Award XP on onboarding completion (`Onboarding.tsx handleComplete()`)

**Major** (gamification loop)
7. Add mission completion interaction — mark complete, update progress
8. Wire mission completion → `award_xp` RPC
9. Add onboarding guard — prevent dashboard access until `onboarding_completed = true`
10. Build or stub `goal-coach` edge function (AI creation flow currently 404s)

**Polish**
11. Loading skeletons for all data-fetching dashboard components
12. Empty state screens with CTAs for zero-data users
13. Error boundaries around dashboard sections
14. Redirect authenticated users from landing page to dashboard

---

## Beta Strategy

### Target Beta Cohort
30–50 women recruited via:
- Survey respondents who opted into the waitlist
- Founder's personal network (warm referrals only)
- Small closed community (Discord or Slack)

### Beta Goals
- Validate that the onboarding → goal → mission → XP loop produces behavioral change
- Identify drop-off points in the first 7 days
- Collect qualitative feedback on tone, trust, and emotional response to AI messaging
- Stress-test Plaid sandbox → validate data accuracy concerns
- Validate survey-to-Sage personalization pipeline

### Success Metrics (Beta)
| Metric | Target |
|--------|--------|
| D7 retention | >40% |
| Onboarding completion rate | >70% |
| Bank connection rate | >50% |
| Goal creation within first week | >60% |
| Mission completion rate | >30% per active user/week |
| NPS (end of beta) | >50 |

---

## Intellectual Property & Research

The Sage-Lavender-Root architecture is being developed as a novel contribution to the field of behaviorally-adaptive AI systems in personal finance. A research paper is in progress for submission to a data engineering and knowledge systems journal.

Key IP claims:
- Dual-agent design separating emotional intelligence from financial analytics, synthesized by an orchestrator
- Behavioral readiness scoring as a gating mechanism for financial recommendation timing
- XP as a behavioral economics instrument tied to real-world financial outcomes rather than app engagement metrics

---

## What finBloom Is Not

- Not a budgeting app (YNAB, Mint)
- Not a robo-advisor or trading platform
- Not a generic wellness app with a finance skin
- Not built for the already-financially-confident user who just needs portfolio tracking

finBloom is for the gap between knowing you should do better and actually doing it — the behavioral and emotional layer that every other finance app skips.

---

*Last updated: May 2026*
