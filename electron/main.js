const { app, BrowserWindow, ipcMain, shell, Menu } = require('electron')
const path = require('path')

const isDev = process.env.NODE_ENV === 'development'

// Single instance lock — prevent opening app twice
const gotLock = app.requestSingleInstanceLock()
if (!gotLock) {
  app.quit()
  process.exit(0)
}

let mainWindow = null
let loginWindow = null

// ── Resolve the correct dist path in both dev and packaged builds ──
function getDistPath() {
  if (isDev) return null
  // In packaged app: resources/app/dist  OR  resources/app.asar/dist
  return path.join(__dirname, '../dist/index.html')
}

// ── Login window ──
function createLoginWindow() {
  loginWindow = new BrowserWindow({
    width: 480,
    height: 560,
    resizable: false,
    center: true,
    title: 'Tornado — Sign In',
    icon: getIconPath(),
    frame: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: true,
    },
    backgroundColor: '#1e3a6e',
    show: false,
  })

  if (isDev) {
    loginWindow.loadURL('http://localhost:5173/#/login')
  } else {
    loginWindow.loadFile(getDistPath(), { hash: '/login' })
  }

  // Remove menu bar on login window
  loginWindow.setMenuBarVisibility(false)

  loginWindow.once('ready-to-show', () => {
    loginWindow.show()
    loginWindow.center()
  })

  loginWindow.on('closed', () => {
    loginWindow = null
    if (!mainWindow) app.quit()
  })
}

// ── Main window ──
function createMainWindow(role) {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    center: true,
    title: 'Tornado',
    icon: getIconPath(),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: true,
      // Allow video file loading from local filesystem
      webviewTag: false,
    },
    backgroundColor: '#e8eef4',
    show: false,
  })

  const route = getRoleRoute(role)

  if (isDev) {
    mainWindow.loadURL(`http://localhost:5173/#${route}`)
  } else {
    mainWindow.loadFile(getDistPath(), { hash: route })
  }

  // Remove default menu (no File/Edit/View native menus)
  mainWindow.setMenuBarVisibility(false)
  Menu.setApplicationMenu(null)

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
    mainWindow.maximize()
  })

  // Open external links in browser, not in Electron
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

function getRoleRoute(role) {
  switch (role) {
    case 'super_admin': return '/admin'
    case 'org_admin':   return '/org-admin'
    case 'manager':     return '/manager'
    case 'collector':   return '/matches'
    default:            return '/matches'
  }
}

function getIconPath() {
  if (isDev) return path.join(__dirname, '../public/icon.png')
  return path.join(__dirname, '../dist/icon.png')
}

// ── App lifecycle ──
app.whenReady().then(() => {
  // Disable default Electron menu globally
  Menu.setApplicationMenu(null)
  createLoginWindow()
})

app.on('second-instance', () => {
  // Focus existing window if user tries to open a second instance
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore()
    mainWindow.focus()
  } else if (loginWindow) {
    loginWindow.focus()
  }
})

app.on('window-all-closed', () => {
  app.quit()
})

app.on('activate', () => {
  // macOS: re-open on dock click
  if (BrowserWindow.getAllWindows().length === 0) createLoginWindow()
})

// ── IPC handlers ──

// Login success → open main window, close login
ipcMain.on('login-success', (event, { role }) => {
  createMainWindow(role)
  if (loginWindow) {
    loginWindow.destroy()
    loginWindow = null
  }
})

// Logout → close main, reopen login
ipcMain.on('logout', () => {
  if (mainWindow) {
    mainWindow.destroy()
    mainWindow = null
  }
  createLoginWindow()
})

// Get app version (used in UI if needed)
ipcMain.handle('get-version', () => app.getVersion())
