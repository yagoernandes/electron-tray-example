const { Tray, Menu } = require('electron')
const workspacesSubmenus = require('./menus/vscode-workspaces')

/**
 * Método de renderizar o menu
 * @param {Tray} tray
 */

let mainTray = {}

const buildMenu = async () =>
	Menu.buildFromTemplate([
		...(await workspacesSubmenus()),
		{ type: 'separator' },
		// ...pontosSubmenu,
		{ type: 'separator' },
		{
			label: 'Sair',
			click: () => {
				process.exit(0)
			},
		},
	])

const render = async (tray = mainTray) => {
	const contextMenu = await buildMenu()
	tray.setToolTip('Denox')
	tray.setContextMenu(contextMenu)
}

module.exports = render
