const {app, BrowserWindow} = require('electron')
const path = require('path')

const isDevMode = process.env.ELECTRON_ENV === 'development';
if (isDevMode) {
  require('electron-reload')(__dirname)
}

let win

function createWindow () {
  win = new BrowserWindow({
    frame: false,
    width: 800,
    height: 600,
    minWidth: 250,
    icon: path.join('file://', __dirname, '/app/img/favicon.ico')
  });
  
  win.loadURL(path.join('file://', __dirname, '/app/index.html'));

  if (isDevMode) {
    win.webContents.openDevTools();
  }

  win.on('closed', function () {
    win = null
  });
}

app.on('ready', createWindow)

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
})

app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
})
