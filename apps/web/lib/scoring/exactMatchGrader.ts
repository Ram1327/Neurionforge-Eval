/**
 * Grades a model output against an expected answer using normalized exact match.
 * Strips whitespace, trailing zeros, thousand separators.
 * Supports optional numeric tolerance for floating-point answers.
 */
export function gradeExactMatch(
  output: string,
  expected: string,
  tolerance?: number
): { passed: boolean; normalized: string } {
  function normalize(s: string): string {
    return s
      .trim()
      .toLowerCase()
      .replace(/,/g, "")
      .replace(/\.0+$/, "")
      .replace(/(\.\d*[1-9])0+$/, "$1");
  }

  // Try to extract just a number/word from the model output
  const numMatch = output.match(/-?\d[\d.,]*/);
  const normOutput = normalize(numMatch ? numMatch[0] : output);
  const normExpected = normalize(expected);

  if (tolerance !== undefined) {
    const numOut = parseFloat(normOutput.replace(/[^0-9.\-]/g, ""));
    const numExp = parseFloat(normExpected);
    if (!isNaN(numOut) && !isNaN(numExp)) {
      return { passed: Math.abs(numOut - numExp) <= tolerance, normalized: normOutput };
    }
  }

  return { passed: normOutput === normExpected, normalized: normOutput };
}
