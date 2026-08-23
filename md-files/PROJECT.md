# PROJECT.md — NeurionForge Eval

> This file contains the complete project context, architecture, data model, projection methodology,
> and development roadmap for **NeurionForge Eval**. Any AI agent working on this codebase must read
> this file FIRST before writing code or proposing changes.

---

## 1. What This Project Is

**NeurionForge Eval** (`eval.neurionforge.com`) is the **second major product** under the [NeurionForge](https://neurionforge.com) brand — an open, developer-first LLM benchmark and evaluation platform.

### The Core Problem & Value Proposition
Evaluating frontier LLMs on custom test suites is prohibitively expensive for solo developers, indie hackers, and small teams. Running a comprehensive suite across frontier models (GPT-5/4o, Claude 3.7 Sonnet/Opus, Gemini 2.5 Pro) costs hundreds of dollars per run.

**NeurionForge Eval solves this with an honest, dual-tier evaluation system:**
1. **Measured Scores:** Real, empirical test runs executed against affordable open-weight models (local via Ollama/vLLM/LM Studio or cloud via OpenRouter/Groq/Together) and user-supplied API keys (BYOK).
2. **Projected Scores:** Statistically projected scores for expensive frontier models, calculated using transparent, published correlation models fit against our Measured calibration set and public benchmark scores (GPQA Diamond, SWE-bench Verified, AIME, MMLU-Pro, Arena Elo).

### The Golden Rule of Credibility
> **The one rule that protects our reputation:** Never let a Projected score render identically to a Measured one.
> Projected scores MUST have distinct visual badges, distinct border styles, confidence intervals (e.g. `84.2% ± 3.1%`), and interactive tooltips showing the exact regression formula and training models.
> The whole product is built on **trust and transparency**.

---

## 2. Core Idea & Projection Engine Mechanics

### How the Projection Flywheel Works
1. **Calibration Set:** We run our proprietary, custom benchmark suites directly on affordable open-weight models (e.g., Llama 3.3 70B, Qwen 2.5 72B/32B/7B, DeepSeek R1/V3, Mistral NeMo, Phi-4). These yield **Measured** ground-truth scores.
2. **Public Benchmarks Reference:** For the same calibration models, we curate their publicly published scores on standard external benchmarks (GPQA Diamond, SWE-bench Verified, AIME 2024, MMLU-Pro, LMSYS Arena Elo). These are public data with $0 API cost.
3. **Transparent Linear Regression (OLS):** We fit a simple, explainable ordinary least squares linear regression model per category:
   $$\text{ProjectedScore}_{\text{category}} = w_1 \cdot \text{GPQA} + w_2 \cdot \text{SWEBench} + w_3 \cdot \text{AIME} + w_4 \cdot \text{ArenaElo}_{\text{norm}} + b$$
4. **Projecting Frontier Performance:** For closed frontier models that cannot be run continuously, we plug their public benchmark scores into the fitted category formula to generate a **Projected Score** with an explicit **confidence interval** (e.g., based on standard error of the estimate).
5. **The Flywheel:** Every new open-weight model evaluated directly on NeurionForge Eval expands the calibration set, refining the weights ($w_i$), improving $R^2$, and making frontier projections increasingly accurate.

---

## 3. System Architecture

Unlike compute-heavy training systems, NeurionForge Eval is orchestration, dataset evaluation, and transparent statistical projection.

```
neurionforge-eval/                     (pnpm monorepo)
├── apps/
│   └── web/                            Next.js 15 (App Router, TS, Tailwind) → Vercel
│       ├── app/
│       │   ├── page.tsx                # Homepage: Projected Leaderboard + "Run Your Model" CTA
│       │   ├── models/[id]/page.tsx    # Model Detail (scores, breakdown, methodology, latency)
│       │   ├── run/page.tsx            # Select Model → Select Benchmark → Run flow
│       │   ├── custom/new/page.tsx     # Custom Evaluation Builder (dataset upload, metrics)
│       │   ├── custom/[shareId]/page.tsx # Shareable Custom Eval report (no login required)
│       │   ├── methodology/page.tsx    # Transparent formulas, calibration set, OLS weights, R²
│       │   └── api/                    # Inngest endpoint, health checks, webhooks
│       │
│       ├── inngest/functions/
│       │   ├── runBenchmark.ts         # Executes Measured run (one model × one benchmark)
│       │   ├── runCustomEval.ts        # Executes user custom eval (LLM-judge with BYOK)
│       │   └── recomputeProjections.ts # Scheduled cron: refit OLS formulas, refresh projections
│       │
│       └── lib/
│           ├── scoring/                # Deterministic graders: exact-match, unit-test, MCQ
│           ├── projection/             # OLS regression fit + confidence interval math
│           └── providers/              # Thin LLM clients (OpenAI, Anthropic, Gemini, OpenRouter, Ollama)
│
├── prisma/
│   └── schema.prisma                   # Supabase PostgreSQL data schema
├── md-files/                           # Agent context and project tracking
└── pnpm-workspace.yaml
```

### Why Inngest for Background Execution
Benchmarking requires executing dozens to hundreds of prompt-response evaluations per model run. Some runs hit rate limits or slow local endpoints taking several minutes. Inngest provides:
- Durable execution with step-level retries.
- Concurrency management and rate-limit handling.
- Zero server maintenance (serverless-friendly on Vercel).
- Scheduled cron triggers for periodic projection recomputation.

---

## 4. Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | Next.js 15 (App Router) + TypeScript | Fullstack React application, SSR for SEO & leaderboard |
| **Styling & UI** | Tailwind CSS + Lucide Icons + Radix UI / Framer Motion | Clean, modern developer-first NeurionForge aesthetic |
| **Database & ORM** | Supabase (PostgreSQL) + Prisma ORM | Model metadata, benchmark definitions, test run storage |
| **Background Jobs** | Inngest (v3) | Durable workflow execution for benchmarks & projection recalculation |
| **LLM Providers** | Custom thin fetch wrappers | OpenAI, Anthropic, Google Gemini, OpenRouter, Ollama / OpenAI-compatible |
| **Statistical Engine** | TypeScript Math / OLS library | Ordinary Least Squares regression, $R^2$, confidence intervals |
| **Storage** | Supabase Storage | Prompt sets, benchmark test cases, user custom datasets |
| **Deployment** | Vercel | Production hosting for `eval.neurionforge.com` |

---

## 5. Data Model (Prisma Schema)

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Model {
  id             String    @id @default(cuid())
  slug           String    @unique
  name           String
  provider       String    // "OpenAI", "Anthropic", "Meta", "Google", "DeepSeek", "Mistral", "Qwen"
  sourceType     String    // "frontier_hosted" | "open_weight" | "local" | "custom"
  description    String?
  contextWindow  Int?
  pricing        Json?     // { inputPer1M: float, outputPer1M: float }
  publicScores   Json?     // { gpqa: float, swebench: float, aime: float, mmluPro: float, arenaElo: float }
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
  testRuns       TestRun[]
}

model Benchmark {
  id             String    @id @default(cuid())
  slug           String    @unique
  name           String
  category       String    // "reasoning" | "coding" | "math" | "knowledge" | "instruction_following" | "long_context" | "structured_output" | "tool_calling" | "safety"
  description    String
  scoringMethod  String    // "exact_match" | "unit_test" | "mcq" | "llm_judge"
  promptSetRef   String    // Supabase storage bucket path or local JSON dataset reference
  sampleCount    Int       @default(0)
  version        Int       @default(1)
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
  testRuns       TestRun[]
}

model TestRun {
  id             String           @id @default(cuid())
  modelId        String
  model          Model            @relation(fields: [modelId], references: [id], onDelete: Cascade)
  benchmarkId    String
  benchmark      Benchmark        @relation(fields: [benchmarkId], references: [id], onDelete: Cascade)
  resultType     String           // "measured" | "projected"
  score          Float            // 0.0 to 100.0
  confidenceLow  Float?           // only populated for projected runs (e.g. 81.1)
  confidenceHigh Float?           // only populated for projected runs (e.g. 87.3)
  projectionId   String?          // foreign key reference to ProjectionModel if projected
  projection     ProjectionModel? @relation(fields: [projectionId], references: [id])
  rawResults     Json?            // breakdown per sample: { promptId, passed, latencyMs, tokens, output }
  latencyAvgMs   Float?
  throughputTps  Float?
  runAt          DateTime         @default(now())
}

model ProjectionModel {
  id                String    @id @default(cuid())
  category          String    // "reasoning" | "coding" | "math" ...
  version           Int       @default(1)
  coefficients      Json      // { gpqa: 0.35, swebench: 0.40, aime: 0.15, arenaElo: 0.10, intercept: 5.2 }
  trainedOnModelIds String[]  // IDs of models in the calibration set
  rSquared          Float?    // Goodness of fit (0.0 to 1.0)
  standardError     Float?
  createdAt         DateTime  @default(now())
  testRuns          TestRun[]
}

model CustomEvaluation {
  id             String    @id @default(cuid())
  shareId        String    @unique @default(cuid()) // No-auth shareable token
  name           String
  description    String?
  datasetUrl     String    // Supabase Storage path
  metrics        String[]  // ["accuracy", "relevance", "instruction_following", "toxicity"]
  judgeModel     String?   // e.g. "gpt-4o-mini" or "claude-3-5-haiku"
  status         String    @default("pending") // "pending" | "running" | "completed" | "failed"
  results        Json?     // Aggregate summary & sample scores
  createdAt      DateTime  @default(now())
}
```

---

## 6. Key Frontend Flows & Pages

1. **Homepage (`/`)**
   - Hero: Clear framing ("We built the tests. Here's how the frontier stacks up — projected from what we know, measured for anyone who runs their own").
   - Leaderboard Table: Composite & category filters (Reasoning, Coding, Math). Clearly badged:
     - 🟢 **Measured** badge with run date & sample size.
     - 🔮 **Projected** badge with confidence interval and tooltip linking to the methodology.
   - Dominant CTA: "Run Your Own Model" / "Test an Endpoint".
   - Recent public runs feed & benchmark summary.

2. **Run Evaluation Flow (`/run`)**
   - Step 1: Select Model
     - Popular Presets (Groq, Together, OpenRouter, OpenAI, Anthropic, Gemini).
     - Custom Endpoint (Ollama / vLLM / LM Studio / Local tunnel URL).
     - BYOK (Bring Your Own Key) entered client-side only (never persisted to DB).
   - Step 2: Select Benchmark Suite (Reasoning, Coding, Math, or Multi-suite).
   - Step 3: Run & Live Progress (Inngest job trigger, real-time sample progress polling/streaming).
   - Step 4: Instant Result Card + Save as Measured `TestRun`.

3. **Model Detail (`/models/[id]`)**
   - Overall score & radar/bar breakdown across all tested categories.
   - Evidence breakdown table showing which benchmarks are Measured vs Projected.
   - Cost per 1M tokens, speed (TPS), context window, and full methodology reference.

4. **Methodology & Transparency Hub (`/methodology`)**
   - Interactive breakdown of the projection formula for every category.
   - Real-time display of weights ($w_i$), intercept ($b$), and $R^2$ fit quality.
   - Calibration set list (the exact open models used to train the regression).
   - Why we do this: full transparency statement on benchmark integrity.

5. **Custom Evaluation Builder (`/custom/new` and `/custom/[shareId]`)**
   - Upload JSONL/CSV test dataset.
   - Select evaluation metrics and provide BYOK judge model credentials.
   - Execute evaluation and generate permanent, private `shareId` URL (no account creation needed).

---

## 7. Security & Cost Guardrails

- **Zero Server-Side Key Storage:** User API keys (OpenAI, Anthropic, OpenRouter, Gemini) and judge keys are strictly kept client-side or in transient request memory. They are NEVER written to PostgreSQL or logged.
- **Zero Platform API Spend for MVP:** All initial measured benchmarks run via local inference or free/cheap tier open-weight providers. LLM-judge custom evals require the user to provide their own judge key.
- **No-Auth Share Links:** Users can create and share custom evals via unguessable `shareId` tokens without requiring friction-heavy signup flows.

---

## 8. Development Roadmap

| Phase | Milestone | Deliverables |
|---|---|---|
| **Phase 0** | Foundations | Monorepo scaffold, Next.js 15, Prisma + Supabase schema, Provider wrappers, Inngest setup, Vercel deployment |
| **Phase 1** | Core Loop (Measured) | 3 objective benchmark datasets (Reasoning, Coding, Math), exact-match & unit-test graders, `/run` flow with BYOK & local tunnels, Results page |
| **Phase 2** | Projection Engine | Curated public benchmark dataset for ~20 frontier/open models, OLS regression engine, Homepage Leaderboard with Projected/Measured badges, `/methodology` page |
| **Phase 3** | Custom Evaluations | Dataset upload (JSONL/CSV), LLM-judge BYOK engine, `/custom/new` builder, `/custom/[shareId]` report view |
| **Phase 4** | Local Connector & Category Expansion | Dedicated lightweight local test runner CLI/agent, expansion to remaining 6 benchmark categories (Knowledge, Instruction Following, Long Context, Structured Output, Tool Calling, Safety) |
| **Phase 5** | Verified Frontier | Periodic sponsored/funded measured runs on frontier models to graduate Projected scores to Measured |

---

## 9. Ground Rules for AI Agents

- Always inspect `CURRENT_STATE.md` to see what is already built before implementing new features.
- Never add or edit files in other product folders (`../Ai-Studio`, `../Home`, `../Agency`).
- Maintain the strict visual separation between **Projected** and **Measured** scores across all components.
- Never store API keys in the database.
- Log all architectural and product decisions in `DECISIONS.md`.
