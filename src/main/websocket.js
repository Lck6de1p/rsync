import WebSocket from 'ws'
import { SYNC_FOLDER_NAME, TEMP_FOLDER_NAME } from './constants'
import { checksumHandler, saveFileName, saveFileData, combineRsyncFile } from './fileHandler'
import { genAllCheckSums } from './rsync'

const serverPath = 'F:\\Demo\\run\\server'

let ws
let syncFolderPath
let tempFolderRootPath

export const initWebSocket = (rootFolderName) => {
  console.log(rootFolderName)
  syncFolderPath = `${rootFolderName}/${SYNC_FOLDER_NAME}`
  tempFolderRootPath = `${rootFolderName}/${TEMP_FOLDER_NAME}`
  // 创建WebSocket客户端
  ws = new WebSocket('ws://10.0.97.189:80/websocket?accessToken=123456')
  // 监听连接打开事件
  ws.on('open', () => {
    console.log('Connected to server')
  })

  // 监听消息接收事件
  ws.on('message', (message) => {
    try {
      // 处理接收到的消息
      const { type, body } = JSON.parse(message)
      switch (type) {
        case 'CHECK_SUM':
          // 本地同步到服务器，
          // TODO: 递归逻辑未处理
          checksumHandler(
            ws,
            new Map(Object.entries(body.checksumsMap)),
            syncFolderPath,
            syncFolderPath
          )
          break
        case 'DIFF_FILES_SYNC':
          // TODO: 服务器更新同步到本地
          combineRsyncFile({ ...body, path: tempFolderRootPath, syncFolderPath })

          break
        case 'FILE_SYNC_INFO':
          saveFileName(tempFolderRootPath, body.fileName)
          break
      }
    } catch (error) {
      saveFileData(tempFolderRootPath, message)
    }
  })

  // 监听连接关闭事件
  ws.on('close', () => {
    console.log('Disconnected from server')
  })
}

export const syncData2Server = () => {
  ws.send(
    JSON.stringify({
      type: 'START_FILE_SYNC',
      body: { folderPath: serverPath }
    })
  )
}

export const syncData2Client = () => {
  const checksumsMap = {}
  genAllCheckSums(syncFolderPath, syncFolderPath, checksumsMap)
  ws.send(
    JSON.stringify({
      type: 'CHECK_SUM',
      body: { checksumsMap }
    })
  )
}
