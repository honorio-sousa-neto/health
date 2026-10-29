import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

// Exercise the shared adapter without opening a real socket.
test("sockets resolve the API origin for Docker and local development", async () => {
  const source = (await readFile(new URL("../src/utils/socket.js", import.meta.url), "utf8"))
    .replace('import { io as connect } from "socket.io-client";', 'const connect = (url, options) => ({ url, options });')
    .replace('import { SessionStorage } from "quasar";', 'const SessionStorage = { getItem: () => ({ token: "session-token" }) };');
  const previousWindow = globalThis.window;
  globalThis.window = { location: { origin: "https://clinic.example" } };
  try {
    const { io } = await import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`);
    for (const url of ["", "/", undefined]) {
      assert.equal(io(url).url, "https://clinic.example");
    }
    assert.equal(io("http://localhost:8020").url, "http://localhost:8020");
    const socket = io("/", { transports: ["websocket"] });
    assert.deepEqual(socket.options.transports, ["websocket"]);
    socket.options.auth(auth => assert.deepEqual(auth, { token: "session-token" }));
  } finally {
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
  }
});
