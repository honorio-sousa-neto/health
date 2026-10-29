import { WorkflowError } from "./security/workflow";
import cors from "cors";
import express from "express";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import routes from "./routers";
import { jwtSecret } from "./security/auth";
import { ZodError } from "zod";
import multer from "multer";
import { safeResponses } from "./security/response";
import { secureSockets } from "./security/socket";

export const createApplication = () => {
  jwtSecret();
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:9008,http://localhost:9000,http://localhost:8080").split(",").map((v) => v.trim());
  const app = express();
  const server: http.Server = http.createServer(app);
  const io = new SocketIOServer(server, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    },
  });
  app.set("io", io);
  app.use(cors({ exposedHeaders: ["Content-Disposition"], origin: allowedOrigins, methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"] }));
  app.use(express.json({ limit: "1mb" }));
  app.use(safeResponses);
  app.disable("x-powered-by");
  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Cache-Control", "no-store");
    next();
  });

  app.get("/healthz", (_req, res) => { res.json({ status: "ok" }); });
  app.use("/api", routes);
  secureSockets(io);
  app.use((req, res) => {
    res.status(404).send("Rota não encontrada.");
  });

  app.use(
    (
      err: any,
      req: express.Request,
      res: express.Response,
      next: express.NextFunction,
    ) => {
      if (err instanceof WorkflowError) { res.status(err.statusCode).json({ success: false, message: err.message }); return; }
      if (err instanceof ZodError) { res.status(400).json({ success: false, message: "Dados inválidos", errors: err.flatten() }); return; }
      if (err instanceof multer.MulterError) { res.status(400).json({ success: false, message: "Ficheiro inválido ou demasiado grande" }); return; }
      console.error("[ERROR]", err?.message ?? err);
      res
        .status(500)
        .json({ success: false, message: "Erro interno do servidor" });
    },
  );

  return { app, server, io };
};
