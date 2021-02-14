const sincronizar = async (page) => {
  const { USUARIO_DENOX, SENHA_DENOX, MYDENOX_URL } = process.env;
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

module.exports = { sincronizar };
