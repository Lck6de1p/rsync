import { app, shell, BrowserWindow, ipcMain, dialog, globalShortcut } from 'electron'
import { getStoreKey } from './store'
import { join } from 'path'
import fs from 'fs'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { initWebSocket, syncData2Server, syncData2Client } from './websocket'
import {
  createRootFolder,
  changePermissionsRecursive,
  openFileByPath,
  fileExistsSync,
  createFolderByPath
} from './file'

async function updateContentByPath() {
  const filePath = await handleFileOpen()
  updateFile(filePath)
}

async function handleFileOpen() {
  const { canceled, filePaths } = await dialog.showOpenDialog()
  if (!canceled) {
    return filePaths[0]
  }
}

async function updateFile(url) {
  fs.writeFile(url, '新内容', 'utf-8', (err) => {
    if (err) {
      console.error('文件更新失败', err)
      return
    }
    console.log('文件更新成功')
  })
}

async function changeFileStatusByPath(event, status) {
  const path = await handleFileOpen()
  changeFileStatus(path, status)
}

const map = {
  r: 0o400,
  rw: 0o777
}
async function changeFileStatus(path, status) {
  fs.chmodSync(path, map[status], (err) => {
    if (err) {
      console.log('失败', err)
    } else {
      console.log('权限改写成功')
    }
  })
}

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 670,
    minWidth: 1200,
    minHeight: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  ipcMain.on('chose-draft', (event, draftId) => {
    console.log(draftId)
  })

  ipcMain.on('set-title', (event, title) => {
    const webContents = event.sender
    const win = BrowserWindow.fromWebContents(webContents)
    win.setTitle(title)
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
  // 生产环境可用控制台
  app.whenReady().then(() => {
    globalShortcut.register('CommandOrControl+Shift+I', () => {
      mainWindow.webContents.openDevTools()
    })
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // 文件or文件夹操作
  ipcMain.handle('createRootFolder', createRootFolder)
  ipcMain.handle('fileExistsSync', (_, filePath) => fileExistsSync(filePath))

  // store
  ipcMain.handle('getStoreKey', getStoreKey)

  ipcMain.handle('dialog:openFile', handleFileOpen)
  ipcMain.handle('update:file', updateContentByPath)
  ipcMain.handle('changeStatus:file', changeFileStatusByPath)

  ipcMain.handle('changePermissionsRecursive', changePermissionsRecursive)
  ipcMain.handle('openFileByPath', openFileByPath)
  ipcMain.handle('createFolderByPath', createFolderByPath)
  ipcMain.handle('initWebSocket', (_, filePath) => initWebSocket(filePath))
  ipcMain.handle('syncData2Server', syncData2Server)
  ipcMain.handle('syncData2Client', syncData2Client)
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')
  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
