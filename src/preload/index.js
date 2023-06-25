import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld('electronAPI', {
      createRootFolder: () => ipcRenderer.invoke('createRootFolder'),
      getStoreKey: (key) => ipcRenderer.invoke('getStoreKey', key),

      updateFile: () => ipcRenderer.invoke('update:file'),
      changeFileStatus: (status) => ipcRenderer.invoke('changeStatus:file', status),
      calMd5Time: () => ipcRenderer.invoke('calMd5Time'),
      changePermissionsRecursive: (folderName, mode) =>
        ipcRenderer.invoke('changePermissionsRecursive', folderName, mode),
      openFileByPath: (filePath) => ipcRenderer.invoke('openFileByPath', filePath),
      fileExistsSync: (filePath) => ipcRenderer.invoke('fileExistsSync', filePath),
      createFolderByPath: (filePath) => ipcRenderer.invoke('createFolderByPath', filePath),
      store: () => ipcRenderer.invoke('store'),
      choseDraft: (draftId) => ipcRenderer.send('chose-draft', draftId)
    })
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}
