# NeurionForge Eval — Implementation Plan

*LLM benchmark & evaluation platform — eval.neurionforge.com*

Locked-in product decision from our last exchange: you can't afford to run
frontier hosted models (GPT-5, Claude, Gemini, ...) through your own test
suite regularly — so frontier scores on your homepage will be **projected**,
not measured, using a model you build from benchmark scores you *can*
afford to produce yourself. This plan is built around making that
projection credible instead of gimmicky, because it's the one part of this
product that could hurt you if it looks like guessing.

---

## 0. The core idea, stated precisely

You already have the right instinct: *"we know our tests very well because
we made them, so there should be a way to project how frontier models would
do."* Here's how to make that defensible rather than hand-wavy:

1. Run your own custom test suite on models you **can** afford — open-weight
   models via free/cheap inference (local, OpenRouter, Groq, Together).
   Call these your **calibration set**.
2. For that same calibration set, you also know their publicly published
   scores on standard external benchmarks (GPQA Diamond, SWE-bench
   Verified, AIME, MMLU-Pro, Arena Elo — all public, no API cost to know
   these numbers).
3. Fit a simple, **explainable** formula per category that maps
   {a model's known public benchmark scores} → {how it did on *your* test}.
   Explainable matters more than accurate-but-opaque here — you want to be
   able to publish the actual weights.
4. For frontier models you can't run, plug their public benchmark scores
   (also freely known, no API call needed) into that formula. Out comes a
   **Projected Score** for your test, with a confidence range, not a false-
   precision single number.
5. Label it unmistakably. This is the whole game — call it "Projected,"
   never "Measured," everywhere it appears. This exact evidence-tiering
   pattern (measured vs. estimated, clearly marked) is already how one of
   the more rigorous players in this space handles incomplete coverage —
   you're not inventing a shady trick, you're adopting a known credibility
   norm. Every measured calibration run makes every projection better, so
   the flywheel is real: the more open models you test directly, the more
   trustworthy your frontier projections get over time.

**The one rule that protects your reputation:** never let a Projected score
render identically to a Measured one. Different badge, different border
style, a tooltip with the actual formula. If this ever reads as "made up
numbers," that's a real reputational risk for a benchmarking company
specifically — the whole product is trust.

---

## 1. Architecture

Simpler than Detect's — this is orchestration and light statistics, not
model inference, so it doesn't need a separate Python service.

```
neurionforge-eval/                     (pnpm monorepo — room for the local
├── apps/                               connector app in Phase 4)
│   └── web/                            Next.js (TS, Tailwind) → Vercel
│       ├── app/
│       │   ├── page.tsx                homepage: projected leaderboard + "Run Your Own Model" CTA
│       │   ├── models/[id]/page.tsx    model detail (scores, methodology, cost, latency)
│       │   ├── run/page.tsx            Select Model → Select Benchmark → Run
│       │   ├── custom/new/page.tsx     custom evaluation builder
│       │   └── custom/[shareId]/page.tsx  view/share a custom eval, no login
│       │
│       ├── inngest/functions/
│       │   ├── runBenchmark.ts         executes a Measured run (one model × one benchmark)
│       │   ├── runCustomEval.ts        executes a user's custom eval (LLM-judge path)
│       │   └── recomputeProjections.ts scheduled: refit formula, refresh Projected scores
│       │
│       └── lib/
│           ├── scoring/                exact-match, unit-test runner, MCQ grader
│           ├── projection/             the weighted-formula fit + predict logic
│           └── providers/              thin clients: OpenAI, Anthropic, Gemini, OpenRouter, generic OpenAI-compatible (local)
│
├── prisma/schema.prisma
└── pnpm-workspace.yaml
```

**Why Inngest (or Trigger.dev) instead of a raw queue:** running a benchmark
means dozens-to-hundreds of prompts per model, some against slow local
endpoints — that's minutes, not milliseconds. You need retries, step-by-step
durability, and scheduling (for the weekly projection refresh) without
standing up Redis/BullMQ yourself. Both have free tiers that comfortably
cover MVP volume; pick Inngest, it's the less fussy of the two to wire into
Next.js.

**Why no separate Python service this time:** the projection formula is
deliberately a simple, explainable weighted-linear model (see §3) —
straightforward in plain TypeScript. If you later want to graduate to a
real ML model for projection, that's the one piece worth pulling into a
Python service — not before.

---

## 2. Data model (Prisma + Supabase)

```prisma
model Model {
  id             String  @id @default(cuid())
  name           String
  provider       String
  sourceType     String  // "frontier_hosted" | "open_weight" | "local" | "custom"
  publicScores   Json?   // { gpqa, swebench, aime, mmluPro, arenaElo, ... } — hand-curated, refreshed as new numbers publish
  updatedAt      DateTime @updatedAt
  testRuns       TestRun[]
}

model Benchmark {
  id             String  @id @default(cuid())
  name           String
  category       String  // reasoning | coding | math | knowledge | instruction_following | long_context | structured_output | tool_calling | safety
  scoringMethod  String  // "exact_match" | "unit_test" | "mcq" | "llm_judge"
  promptSetRef   String  // storage path to the actual prompt/answer set
  version        Int     @default(1)
  testRuns       TestRun[]
}

model TestRun {
  id             String   @id @default(cuid())
  modelId        String
  model          Model    @relation(fields: [modelId], references: [id])
  benchmarkId    String
  benchmark      Benchmark @relation(fields: [benchmarkId], references: [id])
  resultType     String   // "measured" | "projected"
  score          Float
  confidenceLow  Float?   // only set for projected
  confidenceHigh Float?
  projectionId   String?  // which ProjectionModel produced this, if projected
  rawResults     Json?
  runAt          DateTime @default(now())
}

model ProjectionModel {
  id             String   @id @default(cuid())
  category       String
  version        Int
  coefficients   Json     // published, human-readable weights
  trainedOnModelIds String[]
  rSquared       Float?   // fit quality, shown on the methodology page
  createdAt      DateTime @default(now())
}

model CustomEvaluation {
  id             String   @id @default(cuid())
  shareId        String   @unique @default(cuid()) // the no-login access token
  name           String
  description    String?
  datasetUrl     String   // Supabase Storage
  metrics        String[] // accuracy | relevance | instruction_following | toxicity
  createdAt      DateTime @default(now())
}
```

No `users` table here either — same no-accounts principle as Detect.
`CustomEvaluation.shareId` gives people a private link to their own eval
without a login, the same pattern a lot of no-auth tools use for "your
result, bookmark this URL."

**Provider API keys are never stored server-side.** Client-side only,
session memory, passed straight through per request. This is true for
*both* the model under test and, when custom evals need LLM-judge scoring,
the judge model too — same bring-your-own principle applies to the judge,
which keeps your own API costs at zero even for subjective evaluations.

---

## 3. The projection formula, concretely

Keep v1 boring on purpose:

```
projected_score(category) =
    w1 · gpqa_diamond +
    w2 · swebench_verified +
    w3 · aime +
    w4 · arena_elo_normalized
    + b
```

Fit `w1..w4` and `b` per category with ordinary least squares against your
calibration set (models you've Measured directly + their known public
scores). This needs roughly 15–20 calibration models before the fit means
anything — realistic once Phase 1 has been live a few weeks, since every
open-weight model someone runs becomes a data point.

Publish the actual coefficients on the methodology page. "We weight
SWE-bench Verified highest for our Coding projection because it correlated
strongest with our own coding tests" is a genuinely interesting,
credibility-building sentence — most competitors don't show their work at
this level.

**Be honest about the failure mode, internally if not publicly:** this
extrapolates from open models to closed frontier models, which may have
different training recipes and could break the correlation your formula
learned. That's exactly why every projected number needs a confidence range
and a clear label — not a reason not to ship it.

---

## 4. Frontend flow

**Homepage** — the framing you described: *"We built the tests. Here's how
the frontier stacks up — projected from what we know, measured for anyone
who runs their own."* Leaderboard table up top (Projected scores, clearly
badged), "Run Your Own Model" as the dominant CTA beside/below it, not
buried under the leaderboard.

**`/run`** — Select Model (Popular Models / My Models: Provider API, Local)
→ Select Benchmark → Run. This becomes a Measured `TestRun` the moment it
completes.

**`/models/[id]`** — score, category breakdown, methodology (which
benchmark version, which projection formula version if applicable), cost,
latency, last-evaluated date — matches your original spec exactly.

**`/custom/new`** — dataset upload, metric checkboxes, judge-model key
entry, run against any connected model, get a `shareId` link back.

**Local models (Phase 1 version):** no dedicated connector app yet — user
points Ollama/LM Studio through an ngrok or Cloudflare Tunnel URL and pastes
that in. Zero software to build for v1; the dedicated connector is Phase 4
once you know people actually want local evals enough to justify it.

---

## 5. Roadmap

| Phase | Goal | Ships |
|---|---|---|
| **0 — Foundations** | Wiring | Monorepo, Next.js shell on Vercel, Prisma+Supabase schema, provider client wrappers (send-one-prompt-get-one-response for each), Inngest hello-world function deployed |
| **1 — Core Loop (Measured)** | Real product, real data | 3 benchmark categories to start (Reasoning, Coding, Math), all objectively-gradable (MCQ/exact-match/unit-test — no LLM-judge cost yet), full Select→Run flow, bring-your-own-key, local models via tunnel URL, results page. Every run here is a future calibration point. |
| **2 — Projection Engine** | The homepage feature | Curate public-benchmark reference table for ~15–20 frontier/open models, fit the v1 weighted-linear formula once enough calibration data exists, homepage leaderboard goes live with Projected vs Measured clearly badged, methodology page publishing the actual formula, scheduled weekly refresh job |
| **3 — Custom Evaluations** | Developer-facing depth | Dataset upload, LLM-judge scoring (bring-your-own judge key), metrics selection, shareable no-login result links |
| **4 — Local Connector + Category Expansion** | Polish the differentiator | Dedicated local connector replacing the tunnel-URL workaround, remaining categories from your original list (Knowledge, Instruction Following, Long Context, Structured Output, Tool Calling, Safety). Agent testing stays on hold, as you called it. |
| **5 — Verified Frontier (funded stretch)** | Close the loop | Once there's traffic or sponsorship to justify the API spend, start actually running paid calls against a subset of frontier models periodically — graduating select Projected scores to real Measured ones. This is where your original "run benchmarks ourselves" vision fully lands, once it's financially sane. |

Git workflow: same lightweight `main` / `dev` / `feat-branch` flow as
Detect — no need to relearn it for a second repo.
