const { app, BrowserWindow } = require('electron');

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
        icon: './assets/icons/compass_256.png',
        resizable: false
    });

    // mainWindow.loadURL(`file://${__dirname}/app/index.html`);
    mainWindow.loadFile('./app/index.html');
}; 

app.on('ready', createMainWindow);