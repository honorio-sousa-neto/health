import { contextBridge } from "electron";
import { quasarRuntime } from "#q-app/electron/preload";
contextBridge.exposeInMainWorld("quasarRuntime", quasarRuntime);
