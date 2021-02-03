const { resolve, basename } = require("path");
const { app, BrowserWindow, Tray, Menu, dialog } = require("electron");
const { spawn } = require("child_process");
const puppeteer = require("puppeteer");
const fixPath = require("fix-path");
const fs = require("fs");

// Carrega as variaveis de ambiente
require("dotenv").config();

const Store = require("electron-store");
const store = new Store();

const { USUARIO_DENOX, SENHA_DENOX, MYDENOX_URL } = process.env;

let browser;
let page;
// 3: Presente
// 7: Ausente

const workspacesDirectory = `${process.env.HOME}/workspaces`;
let workspacesFilenames = [];
let workspaces = [];
let pontos = [];

fixPath();

let mainTray = {};

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

const filterWorkspaces = (lista) =>
  lista.filter((file) => file.slice(-15) === ".code-workspace");
const formatWorkspace = (filename) => ({
  name: filename.slice(0, -15),
  path: `${workspacesDirectory}/${filename}`,
});

const baterPonto = () => {
  const horario = new Date();
  const isEntrada = !(pontos.length % 2 == 1);
  const dataFormatada = formataData(horario);
  pontos.push({
    isEntrada,
    horario,
    tipoFormatado: isEntrada ? "Entrada" : "Saída",
    horarioFormatado: dataFormatada.hora,
    diaFormatado: dataFormatada.formatado,
    diaNumeros: dataFormatada.somenteNumeros,
    click: () => console.log({ horario, isEntrada, dataFormatada }),
  });
  render();
};

const formataData = (data) => {
  const d = new Date(data);
  const ye = new Intl.DateTimeFormat("en", { year: "numeric" }).format(d);
  const mo = new Intl.DateTimeFormat("en", { month: "2-digit" }).format(d);
  const da = new Intl.DateTimeFormat("en", { day: "2-digit" }).format(d);
  return {
    somenteNumeros: `${da}${mo}${ye}`,
    formatado: `${da}/${mo}/${ye}`,
    hora: d.toString().slice(16, 21),
  };
};

const enviarAviso = (title, message) =>
  dialog.showMessageBox({
    type: "info",
    title: title,
    message: title,
    detail: message,
    buttons: [],
  });

const sincronizarPontos = async () => {
  // enviarAviso(
  //   "Atenção",
  //   "Não desligue o seu computador, seus pontos estão sendo enviados um a um para o servidor."
  // );
  await page.setViewport({ width: 1366, height: 768 });
  await page.goto(`${MYDENOX_URL}/#/`, {
    waitUntil: "networkidle0",
  });
  // Type a keyword into the search box and press enter
  await page.type("#username", USUARIO_DENOX);
  await page.type("#password", SENHA_DENOX);
  page.keyboard.press("Enter");
  await page.waitForNavigation();

  // Wait for the results page to load and display the results
  const botaoPessoa = "#cards > div:nth-child(3) > div";
  await page.waitForSelector(botaoPessoa);
  await page.click(botaoPessoa);
  // await page.waitForNavigation();

  // asdasdasdasd
  const botaoRegistros =
    "#myContent > div > div > div > div.panel.panel-default > div > div.row > div > div > div > div > div > div:nth-child(1) > div > md-table-container > table > tbody > tr > td:nth-child(4) > a.btn.btn-default.glyphicon.glyphicon-list-alt.top_person.top_person_action";
  await page.waitForSelector(botaoRegistros);
  await page.click(botaoRegistros);

  // asdasdasdasd
  const botaoMais =
    "#myContent > div > div > div > div.panel.panel-default > div > div.panel-heading > div.text-right > a";
  await page.waitForSelector(botaoMais);
  await page.click(botaoMais);

  // asdasdasdasd
  const checkboxSituacao =
    "#myContent > div > div > div > div.row > div > div > div.widget-content.center-setting-device > form > div:nth-child(1) > select";
  const dataInput =
    "#myContent > div > div > div > div.row > div > div > div.widget-content.center-setting-device > form > div:nth-child(2) > input";
  const horaInput =
    "#myContent > div > div > div > div.row > div > div > div.widget-content.center-setting-device > form > div:nth-child(3) > input";
  const comentarioInput =
    "#myContent > div > div > div > div.row > div > div > div.widget-content.center-setting-device > form > div:nth-child(4) > textarea";
  const botaoSalvar =
    "#myContent > div > div > div > div.row > div > div > div.widget-content.center-setting-device > button";

  await page.waitForSelector(checkboxSituacao);
  await page.select(checkboxSituacao, !(pontos.length % 2 == 1) ? "3" : "7");

  // await page.type(horaInput, new Date().toString().slice(16, 21));
  await page.type(horaInput, "09:17");

  // await page.type(dataInput, `${da}/${mo}/${ye}`);
  // await page.type(dataInput, "02022021");
  // await page.$eval(dataInput, (el) => {
  //   el.value = "02/02/2021";
  // });
  const time = (message = "", tempo = 500) =>
    new Promise((resolve) => {
      setTimeout(() => {
        console.log(message);
        resolve();
      }, tempo);
    });
  await page.focus(dataInput);
  await time("1");
  await page.type(dataInput, "02022021");

  await page.keyboard.press("Tab");

  await page.type(comentarioInput, "corong@");
  await page.waitForSelector(`${botaoSalvar}:not([disabled])`);
  await page.focus(botaoSalvar);
  // await page.click(botaoSalvar);
  // console.log("---- 3");
};

const mountMenu = (tray, workspaces) => {
  const workspacesSubmenus = workspaces.map(({ name, path }) => ({
    label: name,
    click: () => {
      spawn("code", [path]);
    },
  }));
  const pontosSubmenu = [
    ...pontos.map((ponto) => ({
      label: `${ponto.diaFormatado} - ${ponto.horarioFormatado} (${ponto.tipoFormatado})`,
      click: () => console.log({ ponto }),
    })),
    { type: "separator" },
    {
      label: "Salvar pontos",
      click: sincronizarPontos,
    },
    {
      label: "Bater ponto agora",
      click: baterPonto,
    },
    {
      label: "Bater ponto",
      // click: baterPonto,
      submenu: [
        {
          label: "Bater ponto de entrada",
          click: () => console.log("entrada"),
        },
        {
          label: "Bater ponto de saída",
          click: () => console.log("saida"),
        },
      ],
    },
  ];

  const contextMenu = Menu.buildFromTemplate([
    ...workspacesSubmenus,
    { type: "separator" },
    ...pontosSubmenu,
    { type: "separator" },
    {
      label: "Sair",
      click: () => {
        process.exit(0);
      },
    },
  ]);

  tray.setToolTip("Denox");
  tray.setContextMenu(contextMenu);
};

/**
 * Método de renderizar o menu
 * @param {Tray} tray
 */
const render = (tray = mainTray) => {
  const resposta = spawn("ls", [workspacesDirectory]);

  resposta.stdout.on("data", (data) => {
    const texto = data.toString();
    const arquivos = texto.split("\n");
    workspacesFilenames = filterWorkspaces(arquivos);
    workspaces = workspacesFilenames.map(formatWorkspace);
    mountMenu(tray, workspaces);
  });

  resposta.stderr.on("data", (data) => {
    console.error(`stderr: ${data}`);
  });

  resposta.on("close", (code) => {
    console.log(`child process exited with code ${code}`);
  });
};
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
  puppeteer.launch({ headless: false }).then((browserGenerated) => {
    if (page) {
      page.close();
      page = null;
    }
    if (browser) {
      browser.close();
      browser = null;
    }
    browser = browserGenerated;
    browser.newPage().then((newPageGenerated) => {
      page = newPageGenerated;
    });
  });
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
 */
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    mainTray = new Tray(resolve(__dirname, "assets", "trayIcon.png"));
    render(mainTray);
  }
});
