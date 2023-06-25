import WebSocket from 'ws'
import fs from 'fs'
import { checkExitDiff, generateBlockChecksums, genBlockChecksums } from './rsync'
import { rootFolderPath, syncFolderName, tempFolderName, CHUNK_SIZE } from './common'
import { fileExistsSync, createFolderByPath, fileRmdirSync, getFileSize } from './file'
import { zipFolder } from './zip'
import { arraysAreEqual } from '@/utils/array'
import { calculateFileBase64ByPath } from './md5'
import { intToByte } from '@/utils/index.js'
const syncFolderPath = `${rootFolderPath}/${syncFolderName}`
const tempFolderRootPath = `${rootFolderPath}/${tempFolderName}`
const serverPath = 'F:\\Demo\\run\\server'

if (!fileExistsSync(tempFolderRootPath)) {
  createFolderByPath(tempFolderRootPath)
}

// 读取指定文件夹下的所有文件
const files = fs.readdirSync(syncFolderPath).filter((v) => !v.startsWith('.'))
// 创建WebSocket客户端
const ws = new WebSocket('ws://10.0.63.12:80/websocket?accessToken=123456')
// const ws = new WebSocket('ws://127.0.0.1:80/websocket?accessToken=123456')
// 监听连接打开事件
ws.on('open', () => {
  console.log('Connected to server')

  // 发送消息给服务器
  // ws.send(
  //   JSON.stringify({
  //     type: 'START_FILE_SYNC',
  //     body: { folderPath: serverPath }
  //     // type: 'START_FILE_SYNC_REQUEST',
  //     // body: { folderPath: '/Users/linchuanke/Downloads/server' }
  //   })
  // )
})

// 监听消息接收事件
ws.on('message', (message) => {
  // 处理接收到的消息
  const { type, body } = JSON.parse(message)
  console.log(type, body)
  switch (type) {
    case 'CHECK_SUM':
      // case 'CHECK_SUM_RESPONSE':
      checksumHandler(new Map(Object.entries(body.checksumsMap)), files, syncFolderPath)
      break

    default:
      break
  }
})

// 监听连接关闭事件
ws.on('close', () => {
  console.log('Disconnected from server')
})

const checksumHandler = (serverChecksumsMap, files, folderPath) => {
  const { state, clientChecksumsMap } = checkExitDiff(serverChecksumsMap, files, folderPath)
  if (!state) {
    // TODO:同步功能
    // 1、创建临时目录
    const { tempFolderPath, folderName } = getTempFolder()
    // 2、存储不需要同步的文件路径信息
    const noSyncFileSets = []
    // 3、处理消息，获取最终差异文件zip包路径
    dealCheckSumsMsg(tempFolderPath, serverChecksumsMap, clientChecksumsMap, noSyncFileSets)
    sendFileWebSocket(tempFolderPath, folderName, noSyncFileSets)
    // TODO: 删除临时目录
  } else {
    console.log('没有文件变动，无需同步')
  }
}
// 创建临时文件夹
const getTempFolder = () => {
  const folderName = `diff-${new Date().getTime()}`
  const tempFolderPath = `${rootFolderPath}/${tempFolderName}/${folderName}`
  if (fileExistsSync(tempFolderPath)) {
    fileRmdirSync(tempFolderPath)
  }
  createFolderByPath(tempFolderPath)

  return { tempFolderPath, folderName }
}

// TODO:发送websocket
const sendFileWebSocket = async (tempFolderPath, folderName, setNoSyncFileSets) => {
  await zipFolder(tempFolderPath, tempFolderPath + '.zip')
  const fileLength = getFileSize(tempFolderPath + '.zip')

  ws.send(
    JSON.stringify({
      type: 'FILE_SYNC_INFO',
      body: { fileName: `${folderName}.zip`, fileLength }
    })
  )
  const buf = Buffer.alloc(fileLength)
  const fd = fs.openSync(tempFolderPath + '.zip', 'r')
  fs.readSync(fd, buf, 0, fileLength, 0)
  ws.send(buf)
  const msg = JSON.stringify({
    type: 'DIFF_FILES_SYNC',
    body: {
      fileDigest: calculateFileBase64ByPath(tempFolderPath + '.zip'),
      length: fileLength,
      fileName: `${folderName}.zip`,
      serverPath,
      setNoSyncFileSets
    }
  })
  ws.send(msg)
}

const dealCheckSumsMsg = (
  tempFolderPath,
  serverChecksumsMap,
  clientChecksumsMap,
  noSyncFileSets
) => {
  generateDiffFile(serverChecksumsMap, clientChecksumsMap, tempFolderPath, noSyncFileSets)
}

const generateDiffFile = (
  serverChecksumsMap,
  clientChecksumsMap,
  tempFolderPath,
  noSyncFileSets
) => {
  formateClientChecksumsMap(clientChecksumsMap)
  for (const [fileName, clientChecksum] of clientChecksumsMap.entries()) {
    /**
     * TODO:
     * 1、服务器存在，本地不存在
     */

    // 服务器存在，本地也存在
    if (serverChecksumsMap.has(fileName)) {
      if (arraysAreEqual(serverChecksumsMap.get(fileName).checksum, clientChecksum.checksum)) {
        noSyncFileSets.push(fileName)
      } else {
        const diffList = rollGetDiff(serverChecksumsMap.get(fileName), fileName)
        generateDiffFileOnTempFolder(diffList, tempFolderPath, fileName, noSyncFileSets)
      }
    } else {
      generateDiffFileOnTempFolder([], tempFolderPath, fileName, noSyncFileSets)
    }
  }
}

const generateDiffFileOnTempFolder = (diffList, tempFolderPath, fileName) => {
  console.log(diffList)

  if (diffList.length) {
    createRsyncFile(diffList, tempFolderPath, fileName)
  } else {
    const tempFilePath = `${tempFolderPath}/${fileName}`
    const syncFilePath = `${syncFolderPath}/${fileName}`
    fs.copyFileSync(syncFilePath, tempFilePath)
  }
}

const SAME = '0'
const DIFF = '1'
const createRsyncFile = (diffList, tempFolderPath, fileName) => {
  const filePath = `${tempFolderPath}/${fileName}`
  fs.appendFileSync(filePath, intToByte(CHUNK_SIZE, 4))
  for (const diff of diffList) {
    if (diff.isMatch) {
      fs.appendFileSync(filePath, intToByte(SAME, 1))
      fs.appendFileSync(filePath, intToByte(diff.index, 4))
    } else {
      fs.appendFileSync(filePath, intToByte(DIFF, 1))

      const len = diff.data.length
      fs.appendFileSync(filePath, intToByte(len, 2))
      fs.appendFileSync(filePath, diff.data)
    }
  }
}

const formateClientChecksumsMap = (clientChecksumsMap) => {
  for (const [key, checksum] of clientChecksumsMap.entries()) {
    clientChecksumsMap.set(key, {
      checksum,
      blockChecksums: generateBlockChecksums(`${syncFolderPath}/${key}`)
    })
  }
}

const rollGetDiff = (serverChecksum, fileName) => {
  const diffList = []
  const filePath = `${syncFolderPath}/${fileName}`
  const srcMap = convert2Map(serverChecksum)
  const allData = fs.readFileSync(filePath)
  let offset = 0
  do {
    offset = checkBlk(allData, srcMap, offset, diffList)
  } while (offset < allData.length)
  return diffList
}

const convert2Map = (serverChecksum) => {
  const map = new Map()
  for (const blockChecksum of serverChecksum.blockChecksums) {
    map.set(blockChecksum.weakChecksum, blockChecksum)
  }
  return map
}

const checkBlk = (allData, srcMap, offset, diffList) => {
  let start = offset
  let bck // 老文件
  let blk // 新文件

  for (start; start < allData.length; start++) {
    blk = getBlock(allData, start, CHUNK_SIZE)
    if (srcMap.has(blk.weakChecksum)) {
      bck = srcMap.get(blk.weakChecksum)
      if (arraysAreEqual(bck.strongChecksum, blk.strongChecksum)) {
        break
      }
    }
  }
  if (blk) {
    const len = start - offset
    if (len > 0) {
      const data = getBuffer(allData, offset, len)
      diffList.push({ isMatch: false, data })
    }
    if (bck) {
      diffList.push({ index: bck.index, isMatch: true })
    }
    return start + CHUNK_SIZE
  } else {
    return start
  }
}

const getBlock = (allData, offset) => {
  return genBlockChecksums({ allData, offset })
}

const getBuffer = (allData, start, len) => {
  return allData.slice(start, len + start)
}

const fileName = '销项发票_202201-06.xlsx'
const path = rootFolderPath + '/server/' + fileName

console.time('rollGetDiff')
const diff = rollGetDiff({ blockChecksums: generateBlockChecksums(path) }, fileName)
console.log(diff)
console.log(diff.filter((v) => !v.isMatch))
console.timeEnd('rollGetDiff')
