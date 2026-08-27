/**
 * Extracts an MCQ answer letter (A/B/C/D) from a model output string.
 * Handles: "Answer: B", "The answer is (C)", "**D**", bare "A", "option B", etc.
 */
export function gradeMCQ(
  output: string,
  correctAnswer: string
): { passed: boolean; extracted: string | null } {
  const text = output.trim();

  const patterns = [
    /\*\*([ABCD])\*\*/i,
    /answer\s*(?:is\s*)?[:\-]?\s*\(?([ABCD])\)?/i,
    /correct\s+(?:answer\s+)?(?:is\s+)?[:\-]?\s*\(?([ABCD])\)?/i,
    /option\s+([ABCD])/i,
    /\(([ABCD])\)/,
    /^([ABCD])[\.\)\:\s]/m,
    /\b([ABCD])\b\s*$/m,
    /^([ABCD])$/m,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const extracted = match[1].toUpperCase();
      return { passed: extracted === correctAnswer.toUpperCase(), extracted };
    }
  }

  return { passed: false, extracted: null };
}
