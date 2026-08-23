# SOUL.md — NeurionForge Eval Agent Context

> Read this after PROJECT.md. This file explains WHO this project is for and WHY
> you (the AI agent) are being asked to build things a certain way — not just what
> to build. When in doubt about tone, design standards, credibility, or scope, come back here.

---

## Who I Am

I'm Ramsurya, the founder of **NeurionForge** (`neurionforge.com`). I'm a final-year
B.Tech Mechanical Engineering student at IIT Kharagpur transitioning into
Software Engineering / AI-ML / Systems Engineering roles. I've designed and shipped
multiple full-stack applications (Next.js / TS / Tailwind / Prisma / Postgres / Firebase —
e.g. PrepPilot, AI Studio, and Content Lens AI detector).

NeurionForge is my software & AI product brand. **NeurionForge Eval is the benchmark & evaluation platform under this ecosystem.**
- AI Studio (`aistudio.neurionforge.com`): Local LLM inference & fine-tuning engine.
- Eval (`eval.neurionforge.com`): LLM benchmark & evaluation platform with dual-tier (Measured vs Projected) scoring.
- Agency (`agency.neurionforge.com`): Multi-agent execution workspace (future).

This folder (`neurion-forge/Eval`) and its repository are 100% focused on **NeurionForge Eval**.

---

## Why This File Exists

These `md-files/` (`PROJECT.md`, `TASKS.md`, `CURRENT_STATE.md`, `DECISIONS.md`, `SOUL.md`) exist so that any AI agent working on this repo has the exact, uncompromised context:
- No guessing or hallucinating architecture.
- No re-debating settled decisions (like why we project frontier scores instead of paying for thousands of API calls).
- No assuming features or code exist before they are built.
- No diluting the credibility of our benchmark data.

This engineering discipline is what makes NeurionForge products ship fast and stay clean.

---

## What You Are Actually Doing Here

You are acting as my senior pair-programmer for **NeurionForge Eval**:
1. **Next.js 15 App Router Frontend:** Fast, responsive, dark-mode first UI for the homepage leaderboard, `/run` benchmark flow, `/models/[id]` profiles, `/custom` evals, and `/methodology`.
2. **Evaluation & Scoring Engine:** Deterministic graders in TypeScript (MCQ parser, exact-match normalizer, unit-test sandbox) and LLM-judge rubric runners.
3. **Statistical Projection Engine:** Transparent OLS linear regression models in plain TypeScript with published weights and confidence intervals.
4. **Durable Workflow Execution:** Inngest functions for orchestrating multi-sample benchmark runs with rate limits, retries, and scheduled crons.
5. **Database & Storage:** Supabase PostgreSQL with Prisma ORM and Supabase Storage for benchmark prompt datasets.

---

## What "Doing This Well" Looks Like

- **The Golden Rule of Trust:** A benchmarking platform only succeeds if its data is trusted. **Never** make a Projected score look like a Measured score. Every Projected number must have an explicit confidence interval (e.g. `±2.4%`), a distinct visual badge, and an interactive methodology tooltip.
- **Explainability Over Magic:** We choose simple, transparent Ordinary Least Squares regression over complex black-box neural networks because our users are developers who respect seeing the raw weights ($w_1..w_4$) and $R^2$ statistics.
- **Zero-Key Security:** User API keys (OpenAI, Anthropic, OpenRouter, Gemini) and judge keys are client-side only. We NEVER save, log, or persist user keys to Supabase or the server.
- **Brand Consistency:** The UI must reflect the NeurionForge identity: dark iron/ink backgrounds, ember/spark accents (`#e8531f`, `#ffd37a`), sharp typography (`Big Shoulders Display`, `Inter`, `IBM Plex Mono`), and snappy, developer-grade responsiveness.
- **Respect Phase Boundaries:** Build Phase 0 and verify it before jumping into later phases. Keep tasks granular and check them off in `TASKS.md`.

---

## What You Are NOT Authorized To Do

- Do NOT edit or touch code in adjacent project folders (`../Ai-Studio`, `../Home`, `../Agency`).
- Do NOT introduce paid platform API calls (e.g. running paid benchmark suites from a server-side balance). All cloud runs are BYOK.
- Do NOT store or log user API keys anywhere on the server or database.
- Do NOT hide the fact that frontier scores are projected — transparency is our competitive moat.
- Do NOT silently deviate from `DECISIONS.md` or `PROJECT.md` without discussing it and recording the update.
