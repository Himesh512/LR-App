const path = require('path');
const url = require('url');
const { app, BrowserWindow, screen, ipcMain, Menu } = require('electron');
const xlsx = require('xlsx');
// use relative path instead of absolute path;
//const Log = require('/home/asite/LR-app/LR-App/models/Log.js')
const Log = require('./models/Log');
const connectDB = require('./config/db.js');
const excelFilePath = './assets/HH.xls';
let workbook = [];
let columnWiseDataLists = [];

//Connect to database
connectDB();

let mainWindow,
    isDev = false;
let indexPath;
const isMac = process.platform === 'darwin' ? true : false

if (
    process.env.NODE_ENV !== undefined &&
    process.env.NODE_ENV === 'development'
) {
    isDev = true;
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
        webPreferences: {
            //devTools: false,
            nodeIntegration: true,
            contextIsolation: false
        }
    });

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

    mainWindow.loadURL(indexPath);

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

function setWorkBook() {
    workbook = xlsx.readFile(`${excelFilePath}`);
}

function getSheetData(sheetNameList) {
    let headers = {};
    let data = [];
    sheetNameList.forEach(function (y) {
        let worksheet = workbook.Sheets[y];
        for (z in worksheet) {
            if (z[0] === '!') continue;
            //parse out the column, row, and value
            let col = z.substring(0, 1);
            let row = parseInt(z.substring(1));
            let value = worksheet[z].v;

            //store header names
            if (row == 1) {
                headers[col] = value;
                continue;
            }

            if (!data[row]) data[row] = {};
            data[row][headers[col]] = value;
        }
        //drop those first two rows which are empty
        data.shift();
        data.shift();
    });
    return data;
}

function setColumnWiseLists(sheetDataList) {
    if (!sheetDataList.length) {
        return;
    }
    
    let sampleObj = sheetDataList[0];
    for (colName in sampleObj) {
        columnWiseDataLists[colName] = sheetDataList.map((data) => {
            return data[colName];
        });
    }

    console.log("Column Wise List ==>", columnWiseDataLists);
}

function loadExcelFileData() {
    setWorkBook();
    let sheetDataList = getSheetData(workbook.SheetNames);
    setColumnWiseLists(sheetDataList);
}

const menu = [
    ...(isMac ? [
        {
            role: 'appMenu'
        }] : []),
    {
        role: 'fileMenu'
    },
    {
        role: 'editMenu'
    },
    // {
    //     lable: 'logs',
    //     submenu: [
    //         {
    //             lable: 'Clear logs',
    //             click: () => clearLogs(),
    //         }
    //     ]
    // },
    // ...(isDev ? [
    //     {
    //         lable: 'Developer',
    //         submenu: [
    //             { role: 'reload' },
    //             { role: 'forceReload' },
    //             { role: 'separator' },
    //             { role: 'toggleDevTools' }
    //         ]
    //     }
    // ] : [])
];

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createMainWindow()
    }
});

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

// Stop error
app.allowRendererProcessReuse = true;

app.on('ready', () => {
    createMainWindow();
    loadExcelFileData();
    const mainMenu = Menu.buildFromTemplate(menu);
    Menu.setApplicationMenu(mainMenu);
});
