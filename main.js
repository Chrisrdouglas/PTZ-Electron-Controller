const electron = require('electron')
const url = require('url')
const path = require('path')

const {app, BrowserWindow, ipcMain} = electron;

function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      //preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  win.loadFile('index.html')
  //win.on('closed', function(){ app.quit();}); // uncomment this to make app quit on main window quit


}
app.allowRendererProcessReuse = false

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})



app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

