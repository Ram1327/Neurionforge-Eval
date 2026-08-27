export type Difficulty = "easy" | "medium" | "hard";

export interface MCQItem {
  id: string;
  prompt: string;
  options: { A: string; B: string; C: string; D: string };
  answer: "A" | "B" | "C" | "D";
  difficulty: Difficulty;
}

export interface MathItem {
  id: string;
  prompt: string;
  answer: string;
  tolerance?: number;
  difficulty: Difficulty;
}

export interface CodingItem {
  id: string;
  prompt: string;
  answer: string;
  difficulty: Difficulty;
}

export type BenchmarkItem = MCQItem | MathItem | CodingItem;

export interface BenchmarkMeta {
  slug: string;
  name: string;
  category: "reasoning" | "coding" | "math";
  scoringMethod: "mcq" | "exact_match";
  description: string;
  items: BenchmarkItem[];
}
