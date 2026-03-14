# Two Minds, One Goal: A Dual-Agent Architecture for Emotionally-Intelligent Financial Guidance

**Draft — Working Document**
*Author: Suhita Goswami · finBloom · Mar 2026

---

## Abstract

Most financial technology applications approach behavior change through a single lens: the data. They surface numbers, generate charts, and issue recommendations — assuming that awareness of one's financial state is sufficient to change it. It is not. This paper argues that meaningful financial behavior change requires simultaneous intervention at two distinct layers: the identity layer, where a person's emotional relationship with money resides, and the action layer, where spending, saving, and investment behavior lives. We describe a dual-agent AI architecture — Sage and Lavender — designed to operate on each layer independently while converging their outputs into personalized micro-goals. We present the design rationale, the orchestration model, and early learnings from building this system into a consumer fintech product. Our central claim is that the separation of emotional reasoning and analytical reasoning into distinct agents, each with its own context window and update cadence, is not merely a product design choice — it is the minimum architectural requirement for AI that can genuinely meet a person where they are.

---

## 1. The Problem With Financial AI Today

When I started building GrowWithFinbloom, I was trying to solve what felt like a straightforward problem: most people know they should be saving more, spending less, and investing earlier. The information is widely available. The tools exist. Yet financial anxiety remains the leading source of stress for adults in the United States, and fewer than half of Americans could cover a $1,000 emergency expense from savings.

The gap between knowing and doing in personal finance is one of the most studied phenomena in behavioral economics. Thaler and Sunstein's work on choice architecture, Ariely's research on predictable irrationality, and Klontz's decades of clinical work on money scripts all point to the same conclusion: financial behavior is not primarily a rational information problem. It is a psychological and emotional one.

Yet when I looked at the landscape of financial AI, everything was built as if it were the opposite. Chatbots that answer questions about index funds. Recommendation engines that surface the "optimal" savings rate. AI coaches that tell users they spend too much on coffee. All of it treats the user as a rational economic agent who simply needs better information, faster.

What was missing was something that could meet a person in the complexity of their actual relationship with money — the anxiety, the avoidance, the aspiration, the shame — and work with it rather than around it. The question I kept coming back to was: what would it look like to build an AI system that understood not just what a user was doing with their money, but why?

---

## 2. Why Two Agents

The first architectural decision I made — and the one that shaped everything else — was to split the AI system into two distinct agents rather than building a single unified model.

This was not the obvious choice. A single large language model, given sufficient context, can reason about both emotional and financial dimensions simultaneously. Many products take this approach. But I became convinced that collapsing these two reasoning domains into one agent was an architectural mistake, not just a product one.

Here is the core problem: the data that informs emotional intelligence about a user and the data that informs financial analysis of a user are not just different in content — they are different in type, update frequency, and reliability.

Emotional context is qualitative, longitudinal, and slow to change. A person's money anxiety, their childhood experiences of financial scarcity, their sense of competence around investment decisions — these do not meaningfully update from transaction to transaction. They form over years and shift over months. They are best captured through language: what a person says about money, how they describe their aspirations, which barriers they name when asked why they don't engage.

Financial context is quantitative, transactional, and fast-moving. A person's current savings velocity, their discretionary spending pattern, the gap between their stated budget and their actual behavior — these update daily. They are best captured through data: account balances, transaction histories, spending category trends.

When you try to reason about both in a single agent, you get a muddled context. The emotional signal gets drowned out by the volume of financial data. The financial analysis gets colored by the emotional framing. More importantly, a single agent cannot maintain the temporal separation these two domains require: emotional context should be stable and treated as ground truth unless explicitly updated by the user, while financial context should be continuously refreshed.

Two agents, each with a clearly bounded domain and its own update logic, solve this problem. The separation is not cosmetic. It is the structural prerequisite for the system to work.

---

## 3. Sage: The Emotional Intelligence Layer

Sage is the first agent. Its domain is the user's psychological and emotional relationship with money.

Sage's context window is composed of:

- **Money origin data** — how money was experienced and discussed in the user's upbringing, which research consistently shows as a primary determinant of adult financial behavior (Klontz & Klontz, 2009)
- **Emotional state signals** — how the user currently feels about engaging with their finances, expressed through onboarding questions and, over time, through conversational interaction
- **Psychological barriers** — the specific friction points that interrupt the user's engagement with financial tasks
- **Aspirational identity** — the user's articulation of who they want to be financially, not just what they want to have
- **Instrument awareness** — which financial tools and products the user understands, which they avoid, and which they are curious about
- **Engagement history** — patterns in when the user shows up, what they engage with, and where they drop off

Sage does not touch transaction data. It does not know how much the user spent at a restaurant last Thursday. This boundary is intentional and important. Sage's job is to understand the person, not audit their behavior.

What Sage produces is a continuously updated psychological profile — not a static label, but a dynamic model of the user's current emotional readiness, their capacity for challenge, and their distance from their aspirational identity. In practice, this profile drives two things: the tone and register in which the system communicates with the user, and the emotional framing of whatever guidance the system offers.

A user who expresses high financial anxiety and describes money as "a constant source of dread" needs to be met with a different posture than a user who describes money as "a tool I'm still learning to use." Sage is what makes that distinction operationally possible.

One design principle I want to name explicitly: Sage is not a therapist. It does not diagnose, it does not probe, and it does not attempt to resolve underlying psychological patterns. Its function is more modest and more appropriate: to ensure that the guidance the system offers is emotionally calibrated to where the user actually is, rather than where a rational economic model assumes they should be.

---

## 4. Lavender: The Analytical Semantic Layer

Lavender is the second agent. Its domain is the user's active financial behavior.

Lavender's inputs are primarily transactional: account balances, transaction histories, category spending, savings flows, debt balances, and investment positions — all sourced from connected bank accounts via Plaid. But Lavender's function is not simply to aggregate and display this data. Any dashboard can do that.

Lavender's function is to build what I think of as a *personal financial grammar* for each user — a semantic layer that transforms raw transactions into behavioral meaning.

This distinction is important. A transaction categorized as "dining" by a payment network tells you almost nothing about a user's financial behavior. Lavender's job is to ask: what does *this user's* restaurant spending pattern mean? Is it social spending (concentrated on weekends, in groups) or emotional spending (clustered around high-stress periods)? Is it substitutive (replacing groceries when time is short) or aspirational (treating dining as a self-investment)? The category is the same. The financial grammar is completely different.

Lavender builds this semantic layer through pattern recognition across multiple dimensions:
- **Temporal patterns** — when spending spikes, when savings reliably happen, when the user checks in
- **Category relationships** — which categories crowd out others under income pressure
- **Goal congruence** — the delta between stated goals and behavioral trajectory
- **Financial capacity signals** — not just current balance, but the structure of income and expenditure that determines what is realistically possible
- **Momentum indicators** — is the user's financial position improving, stable, or deteriorating, and at what rate?

What Lavender produces is a continuously updated behavioral model: what the user is actually doing, what it means in the context of their goals, and what specific actions would most materially move them forward.

Lavender does not know how the user feels about what it finds. It does not know that surfacing a pattern of avoidance spending to a user with high financial shame might trigger disengagement rather than action. That is Sage's domain.

---

## 5. The Orchestration Layer: Where Sage and Lavender Converge

The two agents produce outputs that are useful independently but powerful only when synthesized. The orchestration layer is where this synthesis happens — and it is the most architecturally novel part of the system.

The orchestration layer's function is to answer a single question: *given what Sage knows about who this user is emotionally, and what Lavender knows about what this user is doing financially, what is the single most useful thing to surface to them right now?*

This question requires holding both models simultaneously and reasoning about their intersection. Some concrete examples of what this looks like in practice:

**Example 1.** Lavender detects that the user has accumulated $340 in a checking account over the past six weeks without moving it to savings — an emergent savings behavior the user hasn't formally named as a goal. Sage's model shows the user is a curious-but-cautious beginner with low confidence around investment decisions but expressed a strong aspiration to "have money working for her." The orchestration layer does not surface an investment recommendation. It surfaces a mission: *"Name this money. Give your $340 a job this week."* The framing matches Sage's read. The opportunity comes from Lavender.

**Example 2.** Lavender detects a 34% increase in discretionary spending over the past three weeks, concentrated in food delivery. Sage's model shows the user is under active stress (recent low engagement, expressed anxiety about "keeping up") and has identified avoidance as her primary barrier. The orchestration layer does not surface a spending alert. It surfaces a check-in from Sage: *"How's your week going? Sometimes the way we spend tells us something about how we're feeling."* Surfacing a budget warning to this user at this moment would accelerate disengagement.

The orchestration layer is not a large language model making holistic decisions. It is a structured decision function: a set of rules and weights that determine which agent's signal takes priority in a given context, what type of output is appropriate (mission, insight, check-in, alert, or silence), and how the output should be framed.

This structured approach is deliberate. An unconstrained LLM orchestrator would occasionally make brilliant decisions and occasionally make deeply inappropriate ones — and in a domain touching financial anxiety, the cost of the latter is high. The orchestration layer is designed to be predictable, auditable, and conservative by default.

---

## 6. The Output: Micro-Goals as Convergence Artifacts

The primary output of the Sage-Lavender synthesis is not advice. It is action.

Specifically, it is what we call missions: small, time-bounded financial actions that are calibrated simultaneously to the user's emotional readiness (Sage) and their most impactful financial opportunity (Lavender).

The design of missions deserves specific attention because it encodes the system's core behavioral theory.

Most financial guidance fails at the action layer not because it identifies the wrong goal, but because it identifies the wrong *size* of goal. "Save three months of expenses" is correct advice for almost everyone. It is also demotivating for almost everyone who doesn't already have it. The distance between present state and goal is so large that the goal functions not as a target but as a reminder of inadequacy.

Micro-goals solve this by operating at a different resolution. A mission is not "build an emergency fund." It is "move $50 to savings this week and label it 'cushion start.'" The financial effect is real but modest. The psychological effect — agency, completion, momentum — is disproportionate.

Critically, the mission parameters are not fixed. A mission generated for a user with high anxiety and low confidence looks different from one generated for a user with high confidence and low engagement — even if Lavender's analysis of both users identifies the same financial opportunity. Sage modulates the difficulty, the framing, and the emotional register of every mission before it surfaces.

This is the operational definition of "meeting the user where they are": the system delivers the right action, at the right size, in the right voice, to the right person, at the right moment.

---

## 7. What We Learned Building This

Building Sage and Lavender into GrowWithFinbloom has surfaced a number of lessons that I think have broader applicability.

**The quality of Sage's inputs is the binding constraint.** Lavender's data is rich and continuous — Plaid provides a constant stream of transactional signal. Sage's data, by contrast, is sparse and front-loaded. Most of what Sage knows about a user comes from onboarding: a few questions about emotional state, one or two free-text responses. For beta, this is workable. At scale, Sage needs a mechanism to update its model continuously — through conversational check-ins, behavioral inference (what the user engages with and what they skip), and periodic explicit reflection prompts. Building the dynamic input layer for Sage is one of the most important open problems in this architecture.

**The survey data and the authenticated profile must be connected.** In our current implementation, the pre-registration survey (which captures the richest qualitative data) and the post-registration profile are not linked. A user who takes the survey and then signs up carries none of that emotional context into Sage's model. This is a structural gap that significantly limits Sage's effectiveness at launch.

**Silence is a valid output.** Early in the design, the orchestration layer was configured to always surface something — a mission, an insight, a check-in. This was wrong. For users in high-avoidance states, any prompt can feel like pressure, and pressure produces disengagement. The orchestration layer now explicitly models "silence" as a valid decision: sometimes the right guidance is no guidance, and simply maintaining a low-friction, available presence.

**Emotional calibration needs explicit user input, not just inference.** Sage's initial model is built from survey and onboarding responses, but users don't always answer strategically. A user who selects "curious and ready to learn" may be describing an aspiration rather than a current state. Building in a lightweight, non-threatening mechanism for users to update Sage's model — "actually, I'm in a difficult month" — makes the system more accurate and also makes users feel genuinely heard rather than categorized.

---

## 8. The Ethical Dimension

Any AI system that deliberately models a user's emotional vulnerabilities and uses that model to influence behavior faces a non-trivial ethical question: at what point does emotionally-aware guidance become manipulation?

This is not a hypothetical concern. Sage has access to information about financial anxiety, shame, avoidance patterns, and aspirational identity. Used without constraints, this information could be used to maximize engagement through pressure and reward rather than to serve the user's genuine financial wellbeing.

We have approached this through three design commitments that I believe should be treated as minimum standards for any system operating in this space.

**First, Sage's model is transparent and user-controllable.** Users can see what Sage knows about them, and they can update it. There is no hidden psychological profile that shapes their experience without their awareness.

**Second, the system optimizes for financial outcomes, not engagement.** This sounds obvious but has real design implications. A system optimized for engagement might use financial anxiety as a hook — surfacing warnings and urgent alerts because they drive logins. A system optimized for financial outcomes recognizes that for high-anxiety users, reducing the aversiveness of engagement is more valuable than maximizing its frequency.

**Third, the system does not exploit the aspiration gap.** The distance between who a user is and who they aspire to be is a powerful motivational lever. It is also, if misused, a source of manufactured inadequacy. Sage frames missions toward the aspirational self, not away from the inadequate present. The difference is subtle in language and significant in effect.

These commitments are embedded in the orchestration layer's decision logic, not just in product marketing. They are enforced architecturally.

---

## 9. Implications and Future Directions

The Sage-Lavender architecture has implications that extend beyond personal finance.

At the broadest level, the claim this paper is making is that any AI system tasked with supporting human behavior change in a domain with significant emotional valence — health, relationships, career, learning — must separate the emotional reasoning layer from the behavioral/analytical layer. The reasons are structural, not stylistic: the data types differ, the update cadences differ, the appropriate outputs differ, and the ethical constraints differ.

For the fintech industry specifically, this suggests a significant reorientation. The dominant product paradigm — build better analytics, surface clearer insights, remove friction from transactions — is insufficient. The binding constraint on financial behavior change is not information quality. It is emotional readiness. Products that don't address the latter will continue to see high churn, low engagement depth, and the familiar pattern of excited onboarding followed by silent attrition.

**Open questions this architecture raises:**

- *How does Sage's model update over long time horizons?* Financial anxiety does not resolve on product timescales. A system that helps a user meaningfully reduce their anxiety and avoidance over 18 months is doing something genuinely different from one that delivers a good first week.

- *Can the orchestration layer be personalized to the user's coordination preferences?* Some users may prefer Sage-led guidance (emotional check-ins, identity framing), others Lavender-led (data, specifics, clear actions). The orchestration layer currently makes this decision based on inferred state; it could be made explicit.

- *What does collaborative Sage-Lavender look like in a multi-user household?* Joint finances involve two people with potentially very different emotional relationships to money. The architecture may need to model the household as a unit with its own emergent emotional dynamics.

---

## 10. Conclusion

The question I started with — what would it look like to build an AI that understood not just what a user was doing with their money, but why — turned out to require a fundamental architectural choice: separating the emotional layer from the analytical layer, giving each its own domain, and building an orchestration system to synthesize their outputs.

Sage and Lavender are not two personalities or two brand characters. They are two reasoning systems with bounded domains and a shared purpose: to produce guidance that is simultaneously informed by who the user is and what their financial data shows, calibrated to meet them where they are, and oriented toward where they want to go.

The result is a system that can deliver personalized financial guidance not in the sense that it surfaces data relevant to your account, but in the sense that it understands the human being attached to that account — their history, their fears, their capacity, their aspiration — and uses that understanding to make guidance that lands.

That is a harder system to build. I believe it is the only kind that works.

---

## References

*[To be completed — key sources to incorporate:]*

- Klontz, B., & Klontz, T. (2009). *Mind Over Money: Overcoming the Money Disorders That Threaten Our Financial Health.* Broadway Business.
- Thaler, R. H., & Sunstein, C. R. (2008). *Nudge: Improving Decisions About Health, Wealth, and Happiness.* Yale University Press.
- Ariely, D. (2008). *Predictably Irrational: The Hidden Forces That Shape Our Decisions.* HarperCollins.
- Kahneman, D. (2011). *Thinking, Fast and Slow.* Farrar, Straus and Giroux.
- Loewenstein, G., & Thaler, R. H. (1989). Anomalies: Intertemporal Choice. *Journal of Economic Perspectives, 3*(4), 181–193.
- Garbinsky, E. N., Mead, N. L., & Grewal, D. (2021). Emotional Bank Accounts: The Effects of Financial Anxiety on Financial Decision Making. *Journal of Consumer Research.*

---

*Draft status: First complete draft. All sections present. Sections 3–5 (agent descriptions) need empirical grounding. Section 7 (learnings) should expand as beta data becomes available. References need full citations.*
