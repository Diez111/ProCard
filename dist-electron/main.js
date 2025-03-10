import { app, BrowserWindow } from "electron";
import path from "path";
const __dirname = path.dirname(new URL(import.meta.url).pathname);
function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: false,
      spellcheck: false,
      autoFillEnabled: false,
    },
  });

  // Configurar Content Security Policy
  mainWindow.webContents.session.webRequest.onHeadersReceived(
    (details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          "Content-Security-Policy": [
            "default-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.youtube.com https://*.doubleclick.net;",
            "img-src 'self' data: https: http:;",
            "media-src 'self' https://www.youtube.com;",
            "frame-src 'self' https://www.youtube.com https://calendar.google.com;",
            "connect-src 'self' https://api.llama-api.com;",
          ].join("; "),
        },
      });
    },
  );

  if (process.env.NODE_ENV === "development") {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }
}
app.commandLine.appendSwitch("disable-features", "AutofillEnableApi");
app.whenReady().then(createWindow);
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
