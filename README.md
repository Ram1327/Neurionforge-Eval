# NeurionForge Eval (`eval.neurionforge.com`)

> Open, developer-first LLM benchmark and evaluation platform with dual-tier (Measured vs Projected) scoring.

---

## 📖 Project Documentation & Agent Context

All core architecture, product decisions, task tracking, and agent context are maintained in the [`md-files/`](./md-files/) directory:

- 📑 [**`md-files/PROJECT.md`**](./md-files/PROJECT.md) — Comprehensive product vision, architecture, projection engine mathematics, Prisma data model, routes, and technology stack.
- 📋 [**`md-files/TASKS.md`**](./md-files/TASKS.md) — Granular phase-by-phase task breakdown (Phase 0 to Phase 5) with checkboxes and checkpoints.
- 📍 [**`md-files/CURRENT_STATE.md`**](./md-files/CURRENT_STATE.md) — Live state tracking what actually exists, deployment status, and next agent steps.
- ⚖️ [**`md-files/DECISIONS.md`**](./md-files/DECISIONS.md) — Log of locked product and technical decisions with rationale.
- 💡 [**`md-files/SOUL.md`**](./md-files/SOUL.md) — Founder context, brand identity, credibility guardrails ("the whole product is trust"), and agent boundaries.

---

## 🎯 Core Concept: Dual-Tier Evaluation

1. **Measured Scores:** Ground-truth empirical evaluations run on affordable open-weight models (local via Ollama/vLLM/LM Studio or cloud via OpenRouter/Groq) and user BYOK endpoints across custom benchmark test suites.
2. **Projected Scores:** Statistically projected scores for expensive closed frontier models (GPT-5/4o, Claude 3.7, Gemini 2.5) derived from an explainable Ordinary Least Squares (OLS) linear regression model fit against our Measured calibration set and public benchmark data (GPQA Diamond, SWE-bench Verified, AIME, MMLU-Pro, Arena Elo).

> **The Golden Rule of Credibility:** Never let a Projected score render identically to a Measured one. Projected scores always display distinct badges, dashed borders, explicit confidence intervals (e.g. `84.2% ± 3.1%`), and interactive methodology tooltips.

---

## 🗺️ Roadmap Overview

| Phase | Milestone | Goal |
|---|---|---|
| **Phase 0** | Foundations | Next.js 15, Prisma + Supabase schema, Provider wrappers, Inngest setup, Vercel deployment |
| **Phase 1** | Core Loop (Measured) | 3 objective benchmark datasets (Reasoning, Coding, Math), exact-match & unit-test graders, `/run` interactive flow with BYOK & local tunnels |
| **Phase 2** | Projection Engine | Curated public benchmark dataset for ~20 models, OLS regression engine, Homepage Leaderboard with Projected/Measured badges, `/methodology` page |
| **Phase 3** | Custom Evaluations | Dataset upload (JSONL/CSV), LLM-judge BYOK engine, `/custom/new` builder, `/custom/[shareId]` no-login shareable reports |
| **Phase 4** | Local Connector & Category Expansion | Dedicated lightweight local test runner CLI/agent, expansion to remaining 6 benchmark categories |
| **Phase 5** | Verified Frontier | Periodic sponsored/funded measured runs on frontier models to graduate Projected scores to Measured |
