const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  // Auth flow
  loginSuccess: (role) => ipcRenderer.send('login-success', { role }),
  logout: () => ipcRenderer.send('logout'),
  // App info
  getVersion: () => ipcRenderer.invoke('get-version'),
  // Flag that we're running inside Electron (not a browser)
  isElectron: true,
  platform: process.platform,
})
