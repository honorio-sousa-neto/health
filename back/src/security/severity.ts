// Mirrors the application's existing triage score; this is not a clinical protocol.
export function severityScore(s: { oxygen?: string | null; fever?: string | null; breathingRate?: string | null; heartbeatRate?: string | null; bloodPressure?: string | null } | null): number {
  if (!s) return 0;
  const crit = (v: string | null | undefined) => ({ GREEN: 1, ORANGE: 2, RED: 3 }[v ?? ""] ?? 0);
  const bpm = Number(s.heartbeatRate);
  const bpmScore = !s.heartbeatRate || !Number.isFinite(bpm) ? 0 : bpm >= 60 && bpm <= 100 ? 1 : bpm >= 40 && bpm <= 120 ? 2 : 3;
  const [sys, dia] = (s.bloodPressure ?? "").split("/").map(Number);
  const bpScore = !s.bloodPressure || !Number.isFinite(sys) ? 0 : sys < 120 && (!dia || dia < 80) ? 1 : sys < 130 ? 2 : 3;
  return crit(s.oxygen) + crit(s.fever) + crit(s.breathingRate) + bpmScore + bpScore;
}
