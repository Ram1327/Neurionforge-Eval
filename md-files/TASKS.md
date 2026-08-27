# TASKS.md — NeurionForge Eval

> Task breakdown for the development of **NeurionForge Eval** (`eval.neurionforge.com`),
> organized by roadmap phases. Update checkbox states and notes as implementation progresses.

---

## Phase 0 — Foundations

*Goal: Scaffold the monorepo, configure Next.js 15, Prisma + Supabase data model, provider wrappers, Inngest setup, and deploy the initial shell to Vercel.*

### Monorepo & Project Scaffolding
- [x] Initialize git repo for `neurionforge-eval` (`https://github.com/Ram1327/Neurionforge-Eval.git`)
- [x] Configure `pnpm-workspace.yaml` and monorepo structure (`apps/web`, `prisma/`, `md-files/`)
- [x] Initialize Next.js 16.3.1 (App Router, TypeScript, Tailwind CSS v4, ESLint) in `apps/web`
- [x] Install UI dependencies: Lucide React, `clsx`, `tailwind-merge`, `framer-motion`, `zod`, `inngest`
- [x] Create local shared type definitions for provider interfaces in `lib/providers/types.ts`

### Database & Schema Setup
- [x] Initialize Prisma in `prisma/` pointing to Supabase PostgreSQL (`DATABASE_URL`, `DIRECT_URL`)
- [x] Define complete schema: `Model`, `Benchmark`, `TestRun`, `ProjectionModel`, `CustomEvaluation`
- [x] Run initial migration / `prisma db push` to Supabase ✅ (all 5 tables created)
- [x] Seed database with initial data (`prisma/seed.ts`): 3 benchmarks + 12 models with curated public scores ✅

### Provider Wrappers & Evaluation Utilities
- [x] Build unified LLM client interface (`lib/providers/index.ts`) with `callProvider()` dispatch
- [x] Implement provider wrappers with error handling & latency metrics:
  - [x] OpenAI client wrapper (`lib/providers/openai.ts`)
  - [x] Anthropic client wrapper (`lib/providers/anthropic.ts`)
  - [x] Google Gemini client wrapper (`lib/providers/gemini.ts`)
  - [x] OpenRouter client wrapper (`lib/providers/openrouter.ts`)
  - [x] Local / Ollama / OpenAI-compatible endpoint wrapper (`lib/providers/ollama.ts`)
- [x] Live roundtrip test each provider ✅

### Inngest & Background Workflow Setup
- [x] Configure Inngest client at `lib/inngest/client.ts`
- [x] Create Hello-World Inngest function at `lib/inngest/functions/helloWorld.ts`
- [x] Serve handler wired at `/api/inngest`
- [x] Verify Hello World end-to-end via Inngest dashboard ✅

### Deployment
- [x] Configure `vercel.json` and pnpm build scripts
- [x] `pnpm build` passes: 0 TypeScript errors, 0 build errors ✅
- [x] `pnpm typecheck` passes: 0 errors ✅
- [x] Push to GitHub (`git push -u origin main`) ✅
- [x] Deploy Next.js shell to Vercel ✅ (eval.neurionforge.com live)
- [ ] Add env vars to Vercel (DATABASE_URL, DIRECT_URL, INNGEST_EVENT_KEY, INNGEST_SIGNING_KEY) ← **Pending**
- [x] Connect custom domain `eval.neurionforge.com` ✅

**Checkpoint:** Blank Next.js 15 shell deployed on Vercel, Supabase connected with Prisma schema, Inngest handler responsive, provider clients verified.

---

## Phase 1 — Core Loop (Measured Evals)

*Goal: Build the end-to-end Measured evaluation pipeline with 3 objective benchmark categories (Reasoning, Coding, Math), exact-match & unit-test graders, `/run` interactive UI, BYOK support, and real-time execution results.*

### Benchmark Datasets & Deterministic Graders
- [ ] Create Reasoning Benchmark dataset (MCQ / logic puzzles, sample size: 25–50 items)
- [ ] Create Coding Benchmark dataset (Python/JS function specs with test cases, sample size: 25–50 items)
- [ ] Create Math Benchmark dataset (GSM8k/AIME-style numeric & algebraic questions with exact normalized solutions)
- [ ] Implement grading engines in `lib/scoring/`:
  - [ ] `mcqGrader.ts`: standard option extraction (A/B/C/D) & regex parsing
  - [ ] `exactMatchGrader.ts`: normalized string / numerical equivalence checker
  - [ ] `unitTestRunner.ts`: safe sandboxed test runner for coding evaluations

### Inngest Benchmark Runner Workflow
- [ ] Implement `runBenchmark.ts` Inngest function:
  - [ ] Step 1: Fetch benchmark prompt set & model credentials
  - [ ] Step 2: Concurrency-controlled execution across prompts (tracking latency, status, output)
  - [ ] Step 3: Run deterministic scoring per output
  - [ ] Step 4: Calculate overall score, average latency, and throughput (tokens/sec)
  - [ ] Step 5: Save result to Supabase as a Measured `TestRun`
- [ ] Real-time progress tracking endpoint / polling mechanism for active runs

### Evaluation UI (`/run`)
- [ ] Model selector component:
  - [ ] Popular Cloud Presets (Groq, Together, OpenRouter, OpenAI, Anthropic, Gemini)
  - [ ] Custom / Local Endpoint (Ollama, vLLM, LM Studio via localhost / tunnel URL)
  - [ ] Client-side BYOK key management (persisted only in browser `sessionStorage` / memory)
- [ ] Benchmark suite selector (Reasoning, Coding, Math, or Full Battery)
- [ ] Run configuration controls (temperature, max sample limit, timeout)
- [ ] Live execution card: animated progress bar, current prompt preview, live pass/fail counts, streaming logs
- [ ] Run completion summary modal with breakdown by category and sample inspection

### Model Detail Page (`/models/[id]`)
- [ ] Model header (name, provider, release date, parameter size, context window)
- [ ] Category breakdown card with score bars and pass rates
- [ ] Evidence Breakdown table: lists every benchmark with clear **Measured** vs **Projected** badges
- [ ] Latency, throughput (TPS), and pricing per 1M tokens display
- [ ] Raw test sample inspector (view prompts, model responses, and grader verdicts)

**Checkpoint:** Any user can visit `/run`, provide their own key or local tunnel, execute a 3-category benchmark, watch real-time progress, and view their verified Measured `TestRun`.

---

## Phase 2 — Projection Engine & Leaderboard

*Goal: Build the statistical projection engine, curate the baseline public benchmark table, launch the public Leaderboard with explicit evidence tiering (Measured vs Projected), and create the `/methodology` transparency page.*

### Public Benchmark Reference & Calibration Curation
- [ ] Curate baseline public benchmark dataset for ~15–20 models (GPQA Diamond, SWE-bench Verified, AIME, MMLU-Pro, Arena Elo)
- [ ] Store curated public scores in `Model.publicScores` JSON
- [ ] Run initial Measured calibration runs across top open-weight models (Llama 3.3, Qwen 2.5, DeepSeek, Mistral) to establish ground-truth data points

### Statistical Projection Engine (`lib/projection/`)
- [ ] Implement Ordinary Least Squares (OLS) multi-variable regression in TypeScript (`olsRegression.ts`)
- [ ] Fit category weights ($w_1, w_2, w_3, w_4$) and intercept ($b$) using the calibration set
- [ ] Compute goodness-of-fit statistics ($R^2$, Residual Standard Error, $p$-values)
- [ ] Implement `predictProjectedScore()` with standard error confidence bounds (e.g. 95% CI: `[confidenceLow, confidenceHigh]`)
- [ ] Create `recomputeProjections.ts` Inngest scheduled function (weekly cron to refit formulas and update Projected `TestRun` records)

### Homepage Leaderboard (`/`)
- [ ] Hero section with NeurionForge branding, clear mission statement, and evidence-tiering legend
- [ ] Interactive Leaderboard Table:
  - [ ] Rank, Model Name, Provider, Category Scores, Overall Score
  - [ ] Category tabs (Overall, Reasoning, Coding, Math)
  - [ ] Filters: Source Type (All, Frontier Hosted, Open Weight, Local)
  - [ ] Search input for model name / provider
- [ ] **Badge System & Visual Credibility:**
  - [ ] 🟢 **Measured Badge**: Solid styling, test date, sample count tooltip
  - [ ] 🔮 **Projected Badge**: Distinct dashed border, confidence range (e.g., `86.4% ± 2.8%`), formula tooltip
- [ ] Prominent "Run Your Model" CTA buttons leading to `/run`
- [ ] Recent public runs ticker / live benchmark feed

### Methodology Page (`/methodology`)
- [ ] Complete documentation of the NeurionForge projection philosophy
- [ ] Live formula display with interactive weight cards per category
- [ ] Published $R^2$ fit scores and regression diagnostics
- [ ] Full list of models in the current Calibration Set with direct links to their Measured runs
- [ ] Public benchmark definitions and data sources (GPQA, SWE-bench, AIME, Arena Elo)
- [ ] "Why We Project" integrity statement addressing bias and extrapolation limits

**Checkpoint:** Homepage leaderboard is live with both Measured and Projected models, badges are visually distinct with confidence intervals, and the methodology page proves complete mathematical transparency.

---

## Phase 3 — Custom Evaluations

*Goal: Enable developers to upload custom prompt/eval datasets, configure LLM-judge evaluations with BYOK credentials, and generate private, shareable result links (`/custom/[shareId]`).*

### Custom Dataset Management
- [ ] File upload component supporting JSONL and CSV formats
- [ ] Schema validator & preview table for custom datasets (e.g., `input`, `expected_output`, `context`)
- [ ] Dataset storage via Supabase Storage buckets

### LLM-as-a-Judge Engine
- [ ] Build LLM judge scoring engine in `lib/scoring/llmJudge.ts`
- [ ] Support standard judging criteria: Accuracy, Relevance, Instruction Following, Hallucination/Toxicity
- [ ] BYOK judge key input (user supplies their own OpenAI/Anthropic/Gemini key for judging to keep platform costs at $0)
- [ ] Structured rubric prompt templates with chain-of-thought grading

### Custom Eval UI & Shareable Reports
- [ ] Custom Eval Builder page (`/custom/new`):
  - [ ] Step 1: Upload dataset & preview rows
  - [ ] Step 2: Select target model (under test) & enter test credentials
  - [ ] Step 3: Select judge model & enter judge credentials
  - [ ] Step 4: Configure metrics & launch eval
- [ ] Implement `runCustomEval.ts` Inngest function with real-time execution updates
- [ ] Shareable report page (`/custom/[shareId]`):
  - [ ] Overview score cards and metric radar chart
  - [ ] Detailed sample-by-sample analysis with LLM judge reasoning traces
  - [ ] Filter by failed / passed test cases
  - [ ] No-login access (shareable URL token) with export to JSON/CSV

**Checkpoint:** Developers can upload their proprietary eval datasets, run evaluations with BYOK judges, and share results via `/custom/[shareId]` links.

---

## Phase 4 — Local Connector & Category Expansion

*Goal: Replace the tunnel-URL workaround with a lightweight local runner utility and expand the benchmark suite to all 9 planned categories.*

### Local Runner CLI / Connector
- [ ] Build lightweight Node.js/Python CLI connector tool (`@neurionforge/eval-connector`)
- [ ] Automatic detection of running local Ollama, LM Studio, or vLLM instances
- [ ] WebSocket / polling bridge to execute eval tasks locally without port forwarding or tunnel URLs

### Category Expansion (6 Additional Categories)
- [ ] Knowledge Benchmark (MMLU-Pro / factual retrieval questions)
- [ ] Instruction Following Benchmark (IFEval-style strict constraint compliance)
- [ ] Long Context Benchmark (Needle-in-a-Haystack / multi-document synthesis)
- [ ] Structured Output Benchmark (Complex JSON schema & regex validation)
- [ ] Tool Calling Benchmark (Multi-turn function selection & argument validation)
- [ ] Safety & Robustness Benchmark (Jailbreak resistance & prompt injection detection)
- [ ] Update OLS projection engine and public score curation to cover expanded categories

**Checkpoint:** 9 full benchmark categories active, local models benchmarkable via native CLI connector without tunnel setup.

---

## Phase 5 — Verified Frontier (Funded Expansion)

*Goal: Periodically execute verified paid runs on frontier models to graduate Projected scores into ground-truth Measured scores.*

- [ ] Automated scheduled runs on top frontier models (GPT-4.5/5, Claude 3.7 Sonnet, Gemini 2.5 Pro)
- [ ] Historical score drift and model version change tracking
- [ ] "Verified by NeurionForge" certification badge on leaderboard

---

## Ongoing & Cross-Phase Tasks

- [ ] Strict adherence to zero-key-storage security policy (client-side only)
- [ ] Maintain NeurionForge design system aesthetic (dark theme, ember accents, clean typography)
- [ ] Update `CURRENT_STATE.md` upon completion of each phase milestone
- [ ] Record all architecture and product decisions in `DECISIONS.md`
- [ ] Monitor Vercel build times and bundle sizes
