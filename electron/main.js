// Reemplaza todos los 'require' por 'import'
import { app, BrowserWindow } from "electron";
import path from "path";

// Si necesitas __dirname en ES Modules
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

  // Carga la aplicación Vite
  if (process.env.NODE_ENV === "development") {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }
}

// Deshabilitar autofill
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
