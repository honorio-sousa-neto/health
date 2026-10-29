import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { authenticate } from "./auth";
import { ROLE_ROOMS } from "../utils/notify";
export function secureSockets(io: Server) {
  io.use(async (socket, next) => {
    try { socket.data.user = await authenticate(socket.handshake.auth?.token ?? ""); next(); }
    catch { next(new Error("Sessão inválida ou expirada")); }
  });
  io.on("connection", (socket) => {
    const user = socket.data.user;
    socket.join(`role:${user.role}`);
    (ROLE_ROOMS[user.role] ?? []).forEach((room) => socket.join(room));
    const payload = jwt.decode(socket.handshake.auth.token) as jwt.JwtPayload;
    const expiry = setTimeout(() => socket.disconnect(true), Math.max(0, payload.exp! * 1000 - Date.now()));
    const refresh = setInterval(async () => {
      try { if ((await authenticate(socket.handshake.auth.token)).role !== user.role) socket.disconnect(true); }
      catch { socket.disconnect(true); }
    }, 60000);
    socket.on("disconnect", () => { clearTimeout(expiry); clearInterval(refresh); });
  });
}
