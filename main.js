const { resolve, basename } = require("path");
const { app, BrowserWindow, Tray, Menu, dialog } = require("electron");
const { spawn } = require("child_process");
const fixPath = require("fix-path");
const fs = require("fs");

const Store = require("electron-store");
const store = new Store();

fixPath();

let mainTray = {};

function getLocale() {
  const locale = app.getLocale();

  switch (locale) {
    case "es-419" || "es":
      return JSON.parse(fs.readFileSync(resolve(__dirname, "locale/es.json")));
    case "pt-BR" || "pt-PT":
      return JSON.parse(fs.readFileSync(resolve(__dirname, "locale/pt.json")));
    default:
      return JSON.parse(fs.readFileSync(resolve(__dirname, "locale/en.json")));
  }
}

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

const render = (tray = mainTray) => {
  const storedProjects = store.get("projects");
  const projects = storedProjects ? JSON.parse(storedProjects) : [];
  console.log(projects);
  const locale = getLocale();
  const items = projects.map(({ name, path }) => ({
    label: name,
    click: () => {
      spawn.sync("code", [path]);
    },
    submenu: [
      {
        label: locale.open,
        click: () => {
          spawn("code", [path], { shell: true });
        },
      },
      {
        label: locale.remove,
        click: () => {
          store.set(
            "projects",
            JSON.stringify(projects.filter((item) => item.path !== path))
          );
          render();
        },
      },
    ],
  }));

  const contextMenu = Menu.buildFromTemplate([
    ...items,
    {
      type: "separator",
    },
    {
      label: "Adicionar novo projeto...",
      click: () => {
        dialog
          .showOpenDialog({ properties: ["openDirectory"] })
          .then((path) => {
            console.log({ path, projects });
            if (path && path.filePaths && path.filePaths.length) {
              store.set(
                "projects",
                JSON.stringify([
                  ...projects,
                  {
                    path: path.filePaths[0],
                    name: basename(path.filePaths[0]),
                  },
                ])
              );
              render();
            }
          });
      },
    },
    {
      type: "separator",
    },
    {
      label: "Sair",
      click: () => {
        process.exit(0);
      },
    },
  ]);

  tray.setToolTip("Denox");
  tray.setContextMenu(contextMenu);
  // tray.on('click', tray.popUpContextMenu);
};

if (app.dock) {
  app.dock.hide();
}

app.whenReady().then(() => {
  mainTray = new Tray(resolve(__dirname, "assets", "trayIcon.png"));
  render(mainTray);
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    mainTray = new Tray(resolve(__dirname, "assets", "trayIcon.png"));
    render(mainTray);
  }
});
