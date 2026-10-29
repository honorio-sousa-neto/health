export function hasExamResult(exam: { resultText: string | null; result: unknown }): boolean {
  return !!exam.resultText?.trim() || (typeof exam.result === "string" ? !!exam.result.trim() : Array.isArray(exam.result) ? exam.result.length > 0 : !!exam.result && typeof exam.result === "object" && Object.keys(exam.result).length > 0);
}
