import type { BenchmarkItem, MCQItem, MathItem, CodingItem } from "../benchmarks/types";
import { gradeMCQ } from "./mcqGrader";
import { gradeExactMatch } from "./exactMatchGrader";

export interface GradeResult {
  passed: boolean;
  extracted?: string | null;
  normalized?: string;
}

export function gradeItem(
  item: BenchmarkItem,
  modelOutput: string,
  scoringMethod: "mcq" | "exact_match"
): GradeResult {
  if (scoringMethod === "mcq") {
    const mcq = item as MCQItem;
    return gradeMCQ(modelOutput, mcq.answer);
  }
  const answerItem = item as MathItem | CodingItem;
  const tolerance = (item as MathItem).tolerance;
  return gradeExactMatch(modelOutput, answerItem.answer, tolerance);
}
