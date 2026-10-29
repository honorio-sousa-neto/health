import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import * as vueRouter from "vue-router";
import { createPinia, defineStore, setActivePinia } from "pinia";
import { ref } from "vue";

async function sourceModule(source) {
  return import("data:text/javascript;base64," + Buffer.from(source).toString("base64"));
}

test("migrated router preserves anonymous redirect, login and authenticated navigation", async () => {
  const routeSource = await readFile(new URL("../src/router/routes.js", import.meta.url), "utf8");
  const routes = (await sourceModule(routeSource.replace(/import\((['"])[^'"]+\1\)/g, "Promise.resolve({ default: { render: () => null } })"))).default;
  let session = null;
  globalThis.__routerLibraries = vueRouter;
  globalThis.__routerRoutes = routes;
  globalThis.__routerSession = { getItem: () => session };
  globalThis.__routerEnvironment = { QUASAR_SERVER: true, QUASAR_VUE_ROUTER_MODE: "hash", QUASAR_VUE_ROUTER_BASE: "/" };
  let source = await readFile(new URL("../src/router/index.js", import.meta.url), "utf8");
  source = source.replace(/import \{ defineRouter as route \} from "#q-app";/, "const route = (factory) => factory;")
    .replace(/import \{([\s\S]*?)\} from "vue-router";/, "const {$1} = globalThis.__routerLibraries;")
    .replace('import routes from "./routes";', "const routes = globalThis.__routerRoutes;")
    .replace('import { SessionStorage } from "quasar";', "const SessionStorage = globalThis.__routerSession;")
    .replaceAll("import.meta.env", "globalThis.__routerEnvironment");
  const router = (await sourceModule(source)).default({});
  await router.push({ name: "welcome" });
  assert.equal(router.currentRoute.value.name, "login");
  session = { id: "test-user", role: "admin" };
  await router.push({ name: "welcome" });
  assert.equal(router.currentRoute.value.name, "welcome");
  assert.ok(router.getRoutes().length >= 138);
  session = null;
  await router.push("/bem-vindo");
  // Navigate through a different route first, so the guard runs again.
  await router.push({ name: "login" });
  await router.push({ name: "welcome" });
  assert.equal(router.currentRoute.value.name, "login");
  for (const key of ["__routerLibraries", "__routerRoutes", "__routerSession", "__routerEnvironment"]) delete globalThis[key];
});

test("Pinia setup stores retain reactivity after the upgrade", () => {
  setActivePinia(createPinia());
  const useCounter = defineStore("migration-check", () => {
    const count = ref(0);
    const increment = () => count.value++;
    return { count, increment };
  });
  const store = useCounter();
  store.increment();
  assert.equal(store.count, 1);
  assert.equal(useCounter(), store);
});

test("protected file downloads send credentials through Axios and refuse foreign origins", async () => {
  let requested, closed = false;
  const tab = { opener: true, close() { closed = true; }, location: { replace() {} } };
  globalThis.__fileAPI = { defaults: { baseURL: "http://localhost:8020/api" }, get: async (url, config) => {
    requested = { url, config }; return { data: new Blob(["%PDF-test"], { type: "application/pdf" }), headers: { "content-type": "application/pdf" } };
  } };
  globalThis.window = { location: { origin: "http://localhost:9008" }, open: () => tab };
  const originalTimeout = globalThis.setTimeout;
  globalThis.setTimeout = (fn) => { fn(); return 0; };
  try {
    const source = (await readFile(new URL("../src/utils/protected-file.js", import.meta.url), "utf8"))
      .replace('import { api } from "src/boot/axios";', "const api = globalThis.__fileAPI;");
    const { openProtectedFile } = await sourceModule(source);
    await openProtectedFile("http://localhost:8020/api/reports/test");
    assert.equal(requested.config.responseType, "blob");
    assert.equal(requested.url.includes("token="), false);
    assert.equal(tab.opener, null);
    await assert.rejects(openProtectedFile("https://untrusted.invalid/file"), /Origem/);
    globalThis.__fileAPI.get = async () => { throw new Error("unauthorized"); };
    await assert.rejects(openProtectedFile("http://localhost:8020/api/reports/test"), /unauthorized/);
    assert.equal(closed, true);
  } finally { globalThis.setTimeout = originalTimeout; delete globalThis.window; delete globalThis.__fileAPI; }
});
