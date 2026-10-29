import { io as connect } from "socket.io-client";
import { SessionStorage } from "quasar";
export function io(url, options = {}) {
  const endpoint = url ? new URL(url, window.location.origin).origin : window.location.origin;
  return connect(endpoint, { ...options, auth: (done) => done({ token: SessionStorage.getItem("alfavida_user")?.token ?? "" }) });
}
export default io;
