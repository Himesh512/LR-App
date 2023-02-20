const { app, BrowserWindow, Menu } = require('electron');

process.env.NODE_ENV = 'development';
const isDev = process.env.NODE_ENV !== 'profuction' ? true : false;
const isMac = process.platform === 'darwin' ? true : false;
console.log(process.platform)

let mainWindow;
let createMainWindow = () => {
    mainWindow = new BrowserWindow({
        title: "LR App",
        width: 500,
        height: 600,
        icon: '${__dirname}/assets/icons/compass_256.png',
        resizable: isDev ? true : false
    });

    mainWindow.loadFile('./app/index.html');
}; 

app.on('ready', () => {
    createMainWindow();

    const mainMenu = Menu.buildFromTemplate(menu);
    Menu.setApplicationMenu(mainMenu);
    mainWindow.on('ready', () => mainWindow = null);
});

const menu = [
    ...(isMac ? [{role : 'appMenu'}] : []),
    {
        label: 'File',
        submenu: [
            {
                label: 'Quit',
                click: () => app.quit()
            }
        ]
    }
];

app.on('window-all-closed', ()=> {
    if(!isMac) {
        app.quit();
    }
});

app.on('activate', () => {
    if(BrowserWindow.getAllWindows().length === 0) {
        createMainWindow();
    }
});