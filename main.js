const electron = require('electron')
const url = require('url')
const path = require('path');
const { create } = require('domain');

const { app, BrowserWindow, Menu, ipcMain } = electron;

function createWindow() {
  // Create menu template
  Menu.setApplicationMenu(Menu.buildFromTemplate(mainMenuTemplate));

  const win = new BrowserWindow({
    width: 1080,
    height: 900,
    resizable: false,
    webPreferences: {
      //preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    }
  })

  win.loadFile('./Views/Index/index.html')
  //win.on('closed', function(){ app.quit();}); // uncomment this to make app quit on main window quit
}

function createControllerWindow() {
  Menu.setApplicationMenu(Menu.buildFromTemplate(mainMenuTemplate));
  const gamepad = new BrowserWindow({
    width: 1080,
    height: 900,
    resizable: false,
    webPreferences: {
      //preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false
    }
  })
  gamepad.loadFile('./controllers/TeensyNunchuck/controller.html')
}

function makeSettingsWindow() {
  const settings = new BrowserWindow({
    width: 1000,
    height: 1000,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    }
  });

  settings.loadFile('./Views/Settings/settings.html');
}

/*function makeControllerSettingsWindow() {
  const settings = new BrowserWindow({
    width: 1000,
    height: 1000,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    }
  });

  settings.loadFile('./Views/Settings/settings.html');
}

function makeCameraSettingsWindow() {
  const settings = new BrowserWindow({
    width: 1000,
    height: 1000,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    }
  });

  settings.loadFile('./Views/Settings/settings.html');
}*/

require('@electron/remote/main').initialize()
app.allowRendererProcessReuse = false

app.whenReady().then(() => {
  createWindow()
  //createControllerWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
      //createControllerWindow();
    }
  })
})



app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
const mainMenuTemplate = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Settings',
        click() { makeSettingsWindow(); }
      },
      {
        label: 'Exit',
        accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
        click() { app.quit(); }
      }]
  }/*,
  {
    label: 'Controller',
    submenu: [
      {
        label: 'Settings',
        click() { makeSettingsWindow(); }
      },
      {
        label: 'Exit',
        accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
        click() { app.quit(); }
      }]
  }*/];

// Add developer tools option if in dev
if (process.env.NODE_ENV !== 'production') {
  mainMenuTemplate.push({
    label: 'Developer Tools',
    submenu: [
      {
        role: 'reload'
      },
      {
        label: 'Toggle DevTools',
        accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+Shift+I',
        click(item, focusedWindow) {
          focusedWindow.toggleDevTools();
        }
      }
    ]
  });
}