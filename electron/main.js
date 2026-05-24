const { app, BrowserWindow, session } = require('electron')
const path = require('path')
const isDev = process.env.NODE_ENV === 'development'

let mainWindow
let loginWindow

function createLoginWindow() {
  loginWindow = new BrowserWindow({
    width: 620,
    height: 520,
    resizable: false,
    center: true,
    title: 'Log in',
    icon: path.join(__dirname, '../public/icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    backgroundColor: '#000000',
    show: false,
  })

  if (isDev) {
    loginWindow.loadURL('http://localhost:5173/#/login')
  } else {
    loginWindow.loadFile(path.join(__dirname, '../dist/index.html'), {
      hash: '/login',
    })
  }

  loginWindow.once('ready-to-show', () => {
    loginWindow.show()
  })

  loginWindow.on('closed', () => {
    loginWindow = null
    if (!mainWindow) app.quit()
  })
}

function createMainWindow(role) {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    center: true,
    title: 'Tornado',
    icon: path.join(__dirname, '../public/icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    backgroundColor: '#f8fafc',
    show: false,
  })

  const route = getRoleRoute(role)

  if (isDev) {
    mainWindow.loadURL(`http://localhost:5173/#${route}`)
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'), {
      hash: route,
    })
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
    mainWindow.maximize()
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

function getRoleRoute(role) {
  switch (role) {
    case 'super_admin': return '/admin'
    case 'org_admin': return '/org-admin'
    case 'manager': return '/manager'
    case 'collector': return '/matches'
    default: return '/matches'
  }
}

app.whenReady().then(() => {
  createLoginWindow()
})

app.on('window-all-closed', () => {
  app.quit()
})

// IPC: login success — open main window, close login window
const { ipcMain } = require('electron')

ipcMain.on('login-success', (event, { role }) => {
  createMainWindow(role)
  if (loginWindow) {
    loginWindow.close()
    loginWindow = null
  }
})

ipcMain.on('logout', () => {
  if (mainWindow) {
    mainWindow.close()
    mainWindow = null
  }
  createLoginWindow()
})
