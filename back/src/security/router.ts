import express, { Request, Response, NextFunction } from "express";
// Express 4 does not forward rejected async handlers to error middleware.
export function asyncRouter(): express.Router {
  const router = express.Router();
  for (const method of ["get", "post", "put", "patch", "delete", "use"] as const) {
    const register = (router[method] as Function).bind(router);
    const wrap = (handler: any): any => Array.isArray(handler) ? handler.map(wrap) :
      typeof handler === "function" && handler.constructor.name === "AsyncFunction"
        ? (req: Request, res: Response, next: NextFunction) => Promise.resolve(handler(req, res, next)).catch(next)
        : handler;
    (router as any)[method] = (...args: any[]) => register(...args.map(wrap));
  }
  return router;
}
