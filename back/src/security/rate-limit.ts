import type { Request, Response, NextFunction } from "express";
const attempts = new Map<string, { count: number; until: number }>();
export function loginLimit(req: Request, res: Response, next: NextFunction) {
  const now = Date.now();
  for (const [key, entry] of attempts) if (entry.until <= now) attempts.delete(key);
  const key = req.ip || req.socket.remoteAddress || "unknown";
  const entry = attempts.get(key) ?? { count: 0, until: now + 15 * 60_000 };
  if (entry.count >= 20 || (!attempts.has(key) && attempts.size >= 10000)) {
    res.setHeader("Retry-After", Math.max(1, Math.ceil((entry.until - now) / 1000)));
    res.status(429).json({ success: false, message: "Demasiadas tentativas. Tente mais tarde." }); return;
  }
  entry.count++; attempts.set(key, entry);
  res.once("finish", () => {
    if (res.statusCode < 400) entry.count = Math.max(0, entry.count - 1);
  });
  next();
}
