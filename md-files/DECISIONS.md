# DECISIONS.md — NeurionForge Eval

> A running log of product and technical decisions and the reasoning behind them,
> so no one (human or agent) re-litigates a settled question or silently reverses it.
> Append new entries at the bottom with a date. Never delete old entries — if a decision
> is reversed, add a new entry explaining why.

---

### 2026-08-18 — Product placement: Eval as a NeurionForge subdomain
**Decision:** NeurionForge Eval lives at `eval.neurionforge.com`, as a core product under the NeurionForge brand portfolio alongside AI Studio (`aistudio.neurionforge.com`) and the Agency (`agency.neurionforge.com`).
**Why:** NeurionForge (`neurionforge.com`) provides brand umbrella credibility. Each subdomain is an autonomous product with its own repo/deployment while maintaining design cohesion and shared user mindshare.

---

### 2026-08-18 — Dual-tier evaluation model: Projected vs Measured
**Decision:** We adopt a two-tier evaluation model:
1. **Measured:** Real empirical benchmark runs on open-weight models (local or cloud inference) and user BYOK endpoints.
2. **Projected:** Statistically projected scores for frontier closed models (GPT-5/4o, Claude 3.7, Gemini 2.5) derived from known public benchmark correlations (GPQA Diamond, SWE-bench Verified, AIME, MMLU-Pro, Arena Elo).
**Why:** Running thousands of evaluations continuously across expensive frontier models is financially impossible for an indie platform. Projected scores allow a comprehensive leaderboard from Day 1 without ongoing API bankruptcy, while every Measured run on open models continuously refines the projection accuracy.

---

### 2026-08-18 — The Golden Rule of Credibility: Strict visual separation
**Decision:** A Projected score must **never** look identical to a Measured score anywhere in the UI (leaderboard, model page, comparison views). Projected scores must use distinct badge colors, dashed borders, explicit confidence ranges (e.g. `84.2% ± 3.1%`), and interactive tooltips disclosing the formula and calibration models.
**Why:** Benchmarking is 100% a trust business. If users suspect we are presenting estimates as empirical measurements, our platform credibility is permanently destroyed. Explicit evidence tiering builds deep trust.

---

### 2026-08-18 — Projection Engine: Explainable linear regression (OLS) in TypeScript
**Decision:** Use a simple, multi-variable Ordinary Least Squares (OLS) linear model in TypeScript ($w_1 \cdot \text{GPQA} + w_2 \cdot \text{SWEBench} + w_3 \cdot \text{AIME} + w_4 \cdot \text{ArenaElo} + b$) and openly publish all coefficients, intercepts, and $R^2$ values on `/methodology`. No opaque ML models or separate Python ML service in v1.
**Why:** Mathematical explainability builds far more credibility than complex black-box neural networks. Publishing the exact weights lets users inspect and verify the methodology. Pure TypeScript keeps the architecture simple within Next.js.

---

### 2026-08-18 — Zero platform API cost: Client-side BYOK and transient key handling
**Decision:** Platform API spend is $0. Users evaluate cloud models or use LLM-as-a-judge custom evaluations by supplying their own API keys (BYOK). All keys are held strictly in client-side memory or transient request headers and are **never** written to disk, database, or server logs.
**Why:** Eliminates financial liability and API token drain while providing bulletproof data security for enterprise and indie users testing proprietary endpoints.

---

### 2026-08-18 — Background execution engine: Inngest
**Decision:** Use Inngest (v3) for durable background job execution (benchmark runs, multi-sample grading, custom evals, and scheduled projection refits) instead of standing up Redis + BullMQ.
**Why:** Inngest runs seamlessly on serverless platforms (Vercel), provides built-in step retries and rate-limiting concurrency control, handles long-running multi-prompt jobs, and has a generous free tier suitable for MVP.

---

### 2026-08-18 — Database: Supabase PostgreSQL + Prisma ORM
**Decision:** Use Supabase (managed Postgres) with Prisma ORM for relational data modeling (Models, Benchmarks, TestRuns, ProjectionModels, CustomEvaluations).
**Why:** PostgreSQL provides robust relational integrity for linking test runs to models and benchmarks, JSON support for granular raw sample scores, and Supabase Storage for benchmark prompt datasets.

---

### 2026-08-18 — Authentication: Frictionless no-accounts model with shareable tokens
**Decision:** No user signup or mandatory accounts required for running benchmarks or creating custom evals. Custom evals generate unguessable, permanent `shareId` tokens (e.g. `/custom/[shareId]`).
**Why:** Follows the proven frictionless pattern of modern developer tools. Eliminates signup drop-off while enabling instant link sharing.

---

### 2026-08-18 — Local model support in Phase 1: Direct endpoint / Tunnel URL
**Decision:** In Phase 1, users connect local Ollama, LM Studio, or vLLM instances by entering their local/tunnel URL (e.g. ngrok, Cloudflare Tunnel, or localhost if run client-side). A dedicated CLI connector app is deferred to Phase 4.
**Why:** Avoids building and distributing separate client desktop software before validating user demand and core evaluation mechanics.

---

### 2026-08-18 — Tech stack: Next.js 15 + TypeScript + Tailwind CSS
**Decision:** Standardize on Next.js 15 (App Router), TypeScript, and Tailwind CSS.
**Why:** Consistent with the NeurionForge ecosystem (AI Studio, PrepPilot, Content Lens). Ensures high code velocity, type safety, and fast SSR rendering for leaderboard SEO.
