const { resolve } = require("path");
const { app, BrowserWindow, Tray, Menu, dialog } = require("electron");
const render = require("./main");

require("dotenv").config();

/**
 * Não exibir o programa na dock (do mac)
 */
if (app.dock) {
  app.dock.hide();
}

/**
 * Programa pronto
 */
app.whenReady().then(() => {
  mainTray = new Tray(resolve(__dirname, "assets", "trayIcon.png"));
  render(mainTray);
});

/**
 * Quando fechar tudo, sair do programa (mac)
 */
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

/**
 * Quando nenhuma janela estiver ativa e o icone for clicado
 * (inútil enquanto o programa for somenete na dock)
 */
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    mainTray = new Tray(resolve(__dirname, "assets", "trayIcon.png"));
    render(mainTray);
  }
});
