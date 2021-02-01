const { resolve } = require("path");
const { app, BrowserWindow, Tray, Menu } = require("electron");

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  win.loadFile("index.html");
}

const start = () => {
  const tray = new Tray(resolve(__dirname, "assets", "tray-icon.png"));

  const contextMenu = Menu.buildFromTemplate([
    { label: "", type: "radio", checked: true },
  ]);

  tray.setToolTip("Aplicação");
  tray.setContextMenu(contextMenu);
};

app.dock.hide();

app.whenReady().then(start);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    start();
  }
});
