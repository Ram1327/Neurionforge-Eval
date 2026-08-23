/**
 * NeurionForge Eval — Prisma Seed Script
 *
 * Seeds the database with:
 * 1. Three starter benchmark definitions (Reasoning, Coding, Math) for Phase 1.
 * 2. ~12 starter models with hand-curated public benchmark scores
 *    (used as the initial calibration set for Phase 2 projections).
 *
 * Run: npx prisma db seed
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding NeurionForge Eval database...");

  // ── Benchmark Definitions ─────────────────────────────────────────────────
  const benchmarks = [
    {
      slug: "reasoning-v1",
      name: "Logical Reasoning v1",
      category: "reasoning",
      description:
        "Multi-hop logical reasoning problems, analogies, and deductive inference tasks. Scored via MCQ exact match.",
      scoringMethod: "mcq",
      promptSetRef: "benchmarks/reasoning-v1.jsonl",
      sampleCount: 30,
      version: 1,
    },
    {
      slug: "coding-v1",
      name: "Coding Completions v1",
      category: "coding",
      description:
        "Python and JavaScript function completion tasks with automated unit test grading. Covers algorithms, string manipulation, data structures.",
      scoringMethod: "unit_test",
      promptSetRef: "benchmarks/coding-v1.jsonl",
      sampleCount: 30,
      version: 1,
    },
    {
      slug: "math-v1",
      name: "Mathematical Reasoning v1",
      category: "math",
      description:
        "GSM8k-style word problems plus symbolic algebra and numeric reasoning. Graded via normalized exact match.",
      scoringMethod: "exact_match",
      promptSetRef: "benchmarks/math-v1.jsonl",
      sampleCount: 30,
      version: 1,
    },
  ];

  for (const benchmark of benchmarks) {
    await prisma.benchmark.upsert({
      where: { slug: benchmark.slug },
      update: benchmark,
      create: benchmark,
    });
    console.log(`  ✓ Benchmark: ${benchmark.name}`);
  }

  // ── Starter Models with curated public scores ─────────────────────────────
  // Public scores sourced from official leaderboards (LMSYS Arena, HuggingFace, Papers).
  // These form the initial calibration set for Phase 2 OLS projection.
  // Note: arenaElo is normalized to 0-100 range from the raw Elo scale (~1000-1400).
  const models = [
    // ── Frontier / Closed (no direct testing in Phase 0-1) ──────────────────
    {
      slug: "gpt-5",
      name: "GPT-5",
      provider: "OpenAI",
      sourceType: "frontier_hosted",
      description: "OpenAI's most capable model as of 2026.",
      contextWindow: 128000,
      pricing: { inputPer1M: 15.0, outputPer1M: 60.0 },
      publicScores: { gpqa: 0.768, swebench: 0.714, aime: 0.876, mmluPro: 0.854, arenaElo: 97 },
    },
    {
      slug: "claude-37-sonnet",
      name: "Claude 3.7 Sonnet",
      provider: "Anthropic",
      sourceType: "frontier_hosted",
      description: "Anthropic's flagship model with extended thinking.",
      contextWindow: 200000,
      pricing: { inputPer1M: 3.0, outputPer1M: 15.0 },
      publicScores: { gpqa: 0.781, swebench: 0.624, aime: 0.807, mmluPro: 0.826, arenaElo: 95 },
    },
    {
      slug: "gemini-25-pro",
      name: "Gemini 2.5 Pro",
      provider: "Google",
      sourceType: "frontier_hosted",
      description: "Google's most capable model with 1M context.",
      contextWindow: 1000000,
      pricing: { inputPer1M: 1.25, outputPer1M: 5.0 },
      publicScores: { gpqa: 0.842, swebench: 0.635, aime: 0.924, mmluPro: 0.841, arenaElo: 96 },
    },
    // ── Open Weight (can be Measured directly) ───────────────────────────────
    {
      slug: "llama-33-70b",
      name: "Llama 3.3 70B Instruct",
      provider: "Meta",
      sourceType: "open_weight",
      description: "Meta's 70B parameter instruction-tuned model.",
      contextWindow: 128000,
      pricing: null,
      publicScores: { gpqa: 0.504, swebench: 0.336, aime: 0.413, mmluPro: 0.667, arenaElo: 68 },
    },
    {
      slug: "qwen25-72b",
      name: "Qwen2.5 72B Instruct",
      provider: "Alibaba",
      sourceType: "open_weight",
      description: "Alibaba's 72B parameter Qwen2.5 model.",
      contextWindow: 128000,
      pricing: null,
      publicScores: { gpqa: 0.493, swebench: 0.397, aime: 0.501, mmluPro: 0.702, arenaElo: 71 },
    },
    {
      slug: "qwen25-32b",
      name: "Qwen2.5 32B Instruct",
      provider: "Alibaba",
      sourceType: "open_weight",
      description: "Alibaba's 32B parameter Qwen2.5 model.",
      contextWindow: 128000,
      pricing: null,
      publicScores: { gpqa: 0.441, swebench: 0.318, aime: 0.437, mmluPro: 0.661, arenaElo: 65 },
    },
    {
      slug: "deepseek-r1",
      name: "DeepSeek R1",
      provider: "DeepSeek",
      sourceType: "open_weight",
      description: "DeepSeek's reasoning-focused model with chain-of-thought.",
      contextWindow: 128000,
      pricing: null,
      publicScores: { gpqa: 0.713, swebench: 0.492, aime: 0.797, mmluPro: 0.840, arenaElo: 84 },
    },
    {
      slug: "deepseek-v3",
      name: "DeepSeek V3",
      provider: "DeepSeek",
      sourceType: "open_weight",
      description: "DeepSeek's general-purpose MoE model.",
      contextWindow: 128000,
      pricing: null,
      publicScores: { gpqa: 0.592, swebench: 0.424, aime: 0.397, mmluPro: 0.756, arenaElo: 79 },
    },
    {
      slug: "mistral-nemo-12b",
      name: "Mistral NeMo 12B",
      provider: "Mistral",
      sourceType: "open_weight",
      description: "Mistral's compact 12B model with strong multilingual support.",
      contextWindow: 128000,
      pricing: null,
      publicScores: { gpqa: 0.313, swebench: 0.218, aime: 0.147, mmluPro: 0.542, arenaElo: 48 },
    },
    {
      slug: "phi-4",
      name: "Phi-4 14B",
      provider: "Microsoft",
      sourceType: "open_weight",
      description: "Microsoft's compact 14B model excelling in reasoning and STEM.",
      contextWindow: 16384,
      pricing: null,
      publicScores: { gpqa: 0.563, swebench: 0.287, aime: 0.683, mmluPro: 0.734, arenaElo: 62 },
    },
    {
      slug: "qwen25-7b",
      name: "Qwen2.5 7B Instruct",
      provider: "Alibaba",
      sourceType: "open_weight",
      description: "Qwen2.5 7B — great performance for a sub-10B model.",
      contextWindow: 128000,
      pricing: null,
      publicScores: { gpqa: 0.362, swebench: 0.241, aime: 0.234, mmluPro: 0.580, arenaElo: 55 },
    },
    {
      slug: "llama-31-8b",
      name: "Llama 3.1 8B Instruct",
      provider: "Meta",
      sourceType: "open_weight",
      description: "Meta's compact 8B Llama model, great for local inference.",
      contextWindow: 128000,
      pricing: null,
      publicScores: { gpqa: 0.328, swebench: 0.196, aime: 0.192, mmluPro: 0.548, arenaElo: 45 },
    },
  ];

  for (const model of models) {
    await prisma.model.upsert({
      where: { slug: model.slug },
      update: model,
      create: model,
    });
    console.log(`  ✓ Model: ${model.name}`);
  }

  console.log("\n✅ Seeding complete!");
  console.log(`   ${benchmarks.length} benchmarks | ${models.length} models`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
