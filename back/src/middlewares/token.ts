import type { NextFunction, Request, Response } from "express";
import { authenticate, Identity } from "../security/auth";
declare global {
  namespace Express {
    interface Request { user?: Identity; userId?: string; }
  }
}
export class Middlewares {
  async verifyToken(req: Request, res: Response, next: NextFunction) {
    const match = /^Bearer ([^\s]+)$/i.exec(req.headers.authorization ?? "");
    if (!match) { res.status(401).json({ success: false, message: "Sessão inválida ou expirada" }); return; }
    try {
      req.user = await authenticate(match[1]);
      req.userId = req.user.id;
    } catch {
      res.status(401).json({ success: false, message: "Sessão inválida ou expirada" }); return;
    }
    next();
  }
}
