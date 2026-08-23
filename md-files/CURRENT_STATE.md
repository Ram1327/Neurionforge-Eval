# CURRENT_STATE.md — NeurionForge Eval

> Snapshot of what actually exists right now — not what's planned. An agent should
> trust this file over its own assumptions about what's "probably" already built.
> Update this whenever real progress is made; stale entries are worse than none.

**Last updated:** 2026-08-20
**Overall status:** Phase 0 — ✅ COMPLETE. Monorepo deployed, Next.js shell built, all provider wrappers and Inngest configured.

---

## What Exists

### Root Monorepo (`d:\Websites-React\neurion-forge\Eval\`)
- `package.json` — Root pnpm workspace manifest with `dev`, `build`, `typecheck`, `lint` scripts
- `pnpm-workspace.yaml` — Declares `apps/web` as workspace package
- `.gitignore`, `.npmrc` — Standard pnpm / Next.js ignores
- `README.md` — Project entry point with links to md-files
- `neurionforge-eval-implementation-plan.md` — Original implementation plan reference

### Design Reference Files
- `index.html` — Full HTML design reference (signal-green theme, complete page layout)
- `styles.css` — Complete CSS design tokens: `--ink:#070908`, `--accent:#1fdfa6`, `--projected:#f5b942`, `--measured:#34d399`
- `main.js` — Canvas animation, scroll reveals, and mobile menu JS

### Next.js App (`apps/web/`)
- **Framework:** Next.js 16.3.1 + TypeScript + Tailwind CSS v4 + ESLint
- **Build:** ✅ `pnpm build` passes with 0 TypeScript errors, 0 build errors

#### Routes
| Route | Type | Status |
|---|---|---|
| `/` | Static (SSG) | ✅ Complete — full homepage (hero, leaderboard, steps, methodology, categories, roadmap, footer) |
| `/api/health` | Dynamic | ✅ Complete — returns `{ status: "ok", phase: 0, timestamp }` |
| `/api/inngest` | Dynamic | ✅ Complete — Inngest handler with Hello World function |

#### App Files
- `app/globals.css` — NeurionForge Eval design tokens (Tailwind v4 `@theme inline`), Google Fonts (Big Shoulders Display, Inter, IBM Plex Mono)
- `app/layout.tsx` — Root layout with SEO metadata (title, description, OG, Twitter cards)
- `app/page.tsx` — Full homepage pixel-faithful to design reference: ForgeCanvas animation, header, hero, leaderboard table (sample data), 3-step run flow, methodology cards, category pills, 6-phase roadmap, tech strip, footer

#### Library
- `lib/providers/types.ts` — Shared interfaces: `ProviderConfig`, `CompletionRequest`, `CompletionResponse`, `ProviderError`
- `lib/providers/openai.ts` — OpenAI Chat Completions wrapper (also works as generic OpenAI-compatible)
- `lib/providers/anthropic.ts` — Anthropic Messages API wrapper
- `lib/providers/gemini.ts` — Google Gemini REST API wrapper (no SDK)
- `lib/providers/openrouter.ts` — OpenRouter adapter (wraps OpenAI with custom baseUrl + headers)
- `lib/providers/ollama.ts` — Local / Ollama / vLLM / LM Studio adapter
- `lib/providers/index.ts` — `callProvider(type, config, request)` unified dispatch
- `lib/inngest/client.ts` — Inngest client (`id: "neurionforge-eval"`)
- `lib/inngest/functions/helloWorld.ts` — Phase 0 verification function (3 steps)

#### Config
- `.env.example` — Template for `DATABASE_URL`, `DIRECT_URL`, `INNGEST_EVENT_KEY`, `INNGEST_SIGNING_KEY`
- `vercel.json` — Build config for Vercel deployment with pnpm

### Prisma (`prisma/`)
- `schema.prisma` — Complete schema: `Model`, `Benchmark`, `TestRun`, `ProjectionModel`, `CustomEvaluation`
- `seed.ts` — Seed script: 3 benchmarks (Reasoning, Coding, Math) + 12 models with curated public scores

### Project Tracking (`md-files/`)
- `PROJECT.md` — Complete architecture, data model, and roadmap
- `TASKS.md` — Phase-by-phase task checklist
- `CURRENT_STATE.md` — This file
- `DECISIONS.md` — All locked decisions with rationale
- `SOUL.md` — Founder context and agent guardrails

---

## What's Deployed / Live

- **Vercel:** Pending — code ready locally and pushed to GitHub
- **GitHub:** `https://github.com/Ram1327/Neurionforge-Eval.git` — up to date on `main`
- **Supabase:** ✅ Fully connected and migrated! All 5 tables created (`Model`, `Benchmark`, `TestRun`, `ProjectionModel`, `CustomEvaluation`) and seeded with 3 benchmarks & 12 starter models.
- **Inngest:** Handler and Hello World function ready at `/api/inngest` — waiting for account keys in Vercel.

---

## Phase 0 Checkpoint Status

| Check | Status |
|---|---|
| `pnpm build` passes with 0 errors | ✅ |
| `pnpm typecheck` passes with 0 errors | ✅ |
| Design system (signal-green palette) applied | ✅ |
| 5 provider wrappers implemented | ✅ |
| Inngest Hello World function configured | ✅ |
| Prisma schema defined | ✅ |
| Supabase schema migrated (`prisma db push`) | ✅ |
| Database seeded (3 benchmarks, 12 models) | ✅ |
| Pushed to GitHub | ✅ |
| Vercel deployment live | ⏳ Ready to deploy |
| Inngest handler verified end-to-end | ⏳ Pending account keys |

---

## What to Do Next

### Immediate (to complete Phase 0 deploy)
1. `git add . && git commit -m "Phase 0: foundations" && git push -u origin main` — push the codebase
2. Create Vercel project → link to `Ram1327/Neurionforge-Eval` → Root Directory: `apps/web` → add env vars → deploy
3. Configure Supabase project → get `DATABASE_URL` + `DIRECT_URL` → run `npx prisma db push` → `npx prisma db seed`
4. Create Inngest account → get `INNGEST_EVENT_KEY` + `INNGEST_SIGNING_KEY` → add to Vercel env → verify Hello World function

### Phase 1 (after Phase 0 confirmed live)
- Build 3 benchmark JSONL datasets (Reasoning, Coding, Math — 30 items each)
- Implement `lib/scoring/` graders (MCQ, exact-match, unit-test)
- Build the `/run` interactive evaluation flow page
- Implement `runBenchmark` Inngest function

---

## Notes for the Next Agent

- **Tailwind v4:** `globals.css` uses `@import "tailwindcss"` and `@theme inline { ... }` — NOT the old `@tailwind base/components/utilities` or `tailwind.config.ts` pattern. All color tokens are `var(--color-*)`.
- **No Supabase yet:** The Prisma client is configured but `DATABASE_URL` is not set. Any code that imports `@prisma/client` and makes DB calls will fail until credentials are provided and `prisma db push` runs.
- **Homepage is Phase 0 shell:** The leaderboard shows sample data hardcoded in `app/page.tsx`. Phase 2 will replace this with live Supabase queries.
- **BYOK is enforced:** Provider wrappers accept `apiKey` as a parameter. There is no place in the codebase where an API key is read from `.env` or stored server-side.
