const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  loginSuccess: (role) => ipcRenderer.send('login-success', { role }),
  logout: () => ipcRenderer.send('logout'),
  isElectron: true,
})
