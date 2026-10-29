import type { Request, Response, NextFunction } from "express";
export function publicPayload(value: unknown): any {
  if (value === undefined) return undefined;
  return JSON.parse(JSON.stringify(value, (key, item) => key === "password" ? undefined : item));
}
// Defence in depth for nested Prisma user relations as well as staff endpoints.
export function safeResponses(_req: Request, res: Response, next: NextFunction) {
  const json = res.json.bind(res);
  res.json = (body: any) => json(body === undefined ? body : publicPayload(body));
  next();
}
