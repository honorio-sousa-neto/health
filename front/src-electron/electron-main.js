import { app, BrowserWindow } from "electron";
import path from "node:path";
import { registerQuasarRuntime, resolveElectronAssetsPath } from "#q-app/electron/main";

async function createWindow() {
  const mainWindow = new BrowserWindow({
    icon: resolveElectronAssetsPath("icons/icon.png"),
    width: 1000,
    height: 600,
    useContentSize: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: path.join(import.meta.dirname, "electron-preload.cjs"),
    },
  });
  mainWindow.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
  if (import.meta.env.QUASAR_DEV) {
    await mainWindow.loadURL(import.meta.env.QUASAR_APP_URL);
    mainWindow.webContents.openDevTools();
  } else {
    await mainWindow.loadFile("index.html");
  }
}

app.whenReady().then(() => {
  registerQuasarRuntime();
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
