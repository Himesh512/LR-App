const path = require('path')
const url = require('url')
const { app, BrowserWindow, screen, ipcMain, Menu } = require('electron')
const Log = require('/home/asite/LR-app/LR-App/models/Log.js')
const connectDB = require('./config/db.js')

//Connect to database
connectDB()

let mainWindow

let isDev = false
const isMac = process.platform === 'darwin' ? true : false

if (
	process.env.NODE_ENV !== undefined &&
	process.env.NODE_ENV === 'development'
) {
	isDev = true
}

function createMainWindow() {
	const { width, height } = screen.getPrimaryDisplay().workAreaSize
	mainWindow = new BrowserWindow({
		title: "LR App",
		width: width,
		height: height,
		show: false,
		icon: `${__dirname}/assets/icons/compass_256.png`,
		// The lines below solved the issue
		resizable: isDev ? true : false,
		autoHideMenuBar: true,
		webPreferences: {
			devTools: false,
			nodeIntegration: true,
			contextIsolation: false
		}
	})

	let indexPath

	if (isDev && process.argv.indexOf('--noDevServer') === -1) {
		indexPath = url.format({
			protocol: 'http:',
			host: 'localhost:8080',
			pathname: 'index.html',
			slashes: true,
		})
	} else {
		indexPath = url.format({
			protocol: 'file:',
			pathname: path.join(__dirname, 'dist', 'index.html'),
			slashes: true,
		})
	}

	mainWindow.loadURL(indexPath)

	// Don't show until we are ready and loaded
	mainWindow.once('ready-to-show', () => {
		mainWindow.show()

		// Open devtools if dev
		if (isDev) {
			const {
				default: installExtension,
				REACT_DEVELOPER_TOOLS,
			} = require('electron-devtools-installer')

			installExtension(REACT_DEVELOPER_TOOLS).catch((err) =>
				console.log('Error loading React DevTools: ', err)
			)
			//mainWindow.webContents.openDevTools()
		}
	})

	mainWindow.on('closed', () => (mainWindow = null))
}

app.on('ready', () => {
	createMainWindow()
	// const mainMenu = Menu.buildFromTemplate(menu)
	// Menu.setApplicationMenu(mainMenu)
})

const menu = [
	...(isMac ? [{ role: 'appMenu' }] : []),
	{
		role: 'fileMenu'
	},
	{
		role: 'editMenu'
	},
	{
		lable: 'logs',
		submenu: [
			{
				lable: 'Clear logs',
				click: () => clearLogs(),
			}
		]
	},
	...(isDev ? [
		{
			lable: 'Developer',
			submenu: [
				{ role: 'reload' },
				{ role: 'forcereload' },
				{ role: 'separator' },
				{ role: 'toggledevtools' }
			]
		}
	] : [])
]
// load logs
ipcMain.on('logs:load', sendLogs)



// Create Log
ipcMain.on('logs:add', async (e, item) => {
	try {
		await Log.create(item)
		sendLogs()
	} catch (err) {
		console.log(err)
	}
})

// Delete Log
ipcMain.on('logs:delete', async (e, id) => {
	try {
		await Log.findOneAndDelete({ _id: id })
		sendLogs()
	} catch (err) {
		console.log(err)
	}
})

// Send Log items
async function sendLogs() {
	try {
		const logs = await Log.find().sort({ created: 1 })
		mainWindow.webContents.send('logs:get', JSON.stringify(logs))
	} catch (err) {
		console.log(err)
	}
}

// Clear all logs

async function clearLogs() {
	try {
		await Log.deleteMany({})
		mainWindow.webContents, send('logs:clear')
	} catch (err) {
		console.log(err)
	}
}
app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit()
	}
})

app.on('activate', () => {
	if (mainWindow === null) {
		createMainWindow()
	}
})

// Stop error
app.allowRendererProcessReuse = true
