import type { BenchmarkMeta } from "./types";
import { reasoningItems } from "./reasoning";
import { mathItems } from "./math";
import { codingItems } from "./coding";

export const BENCHMARKS: Record<string, BenchmarkMeta> = {
  "reasoning-v1": {
    slug: "reasoning-v1",
    name: "Logical Reasoning v1",
    category: "reasoning",
    scoringMethod: "mcq",
    description: "25-item MCQ covering deductive reasoning, analogies, and logical inference.",
    items: reasoningItems,
  },
  "math-v1": {
    slug: "math-v1",
    name: "Mathematical Reasoning v1",
    category: "math",
    scoringMethod: "exact_match",
    description: "25 arithmetic, algebra, and geometry problems with exact numeric answers.",
    items: mathItems,
  },
  "coding-v1": {
    slug: "coding-v1",
    name: "Coding Completions v1",
    category: "coding",
    scoringMethod: "exact_match",
    description: "25 Python code output prediction questions — no execution required.",
    items: codingItems,
  },
};

export function getBenchmark(slug: string): BenchmarkMeta | null {
  return BENCHMARKS[slug] ?? null;
}
