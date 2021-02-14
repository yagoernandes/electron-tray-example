const { spawn } = require('child_process')
const { WORKSPACES_DIR } = require('../Constants')

const filterWorkspaces = lista =>
	lista.filter(file => file.slice(-15) === '.code-workspace')
const formatWorkspace = filename => ({
	name: filename.slice(0, -15),
	path: `${WORKSPACES_DIR}/${filename}`,
})

module.exports = () => {
	return new Promise((resolve, reject) => {
		console.log('------', WORKSPACES_DIR)
		const resposta = spawn('ls', [WORKSPACES_DIR])

		resposta.stdout.on('data', data => {
			const texto = data.toString()
			const arquivos = texto.split('\n')
			workspacesFilenames = filterWorkspaces(arquivos)
			workspaces = workspacesFilenames.map(formatWorkspace)
			// mountMenu(tray, workspaces)
			resolve(
				workspaces.map(({ name, path }) => ({
					label: name,
					click: () => {
						spawn('code', [path])
					},
				})),
			)
		})

		resposta.stderr.on('data', data => {
			console.error(`stderr: ${data}`)
			reject(data)
		})

		// resposta.on('close', code => {
		// 	console.log(`child process exited with code ${code}`)
		// })
	})
}
