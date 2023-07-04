import fs from 'fs'
import { intToByte, getBuffer } from '@/utils/buffer.js'
import { checkExitDiff, generateBlockChecksums } from '../rsync'
import {
  fileExistsSync,
  createFolderByPath,
  fileRmdirSync,
  getFileSize,
  copyFileInDeepFolderSync
} from '../file'
import { zipFolder } from '../zip'
import { arraysAreEqual } from '@/utils/array'
import {
  SYNC_FOLDER_NAME,
  TEMP_FOLDER_NAME,
  CHUNK_SIZE,
  IS_SAME_BLOCK,
  IS_DIFF_BLOCK
} from '../constants'
import { calculateFileBase64ByPath, RollChecksum, calculateFileHash } from '../md5'
import { getStoreKey } from '../store'
import { ROOT_KEY } from '@/common'

const serverPath = 'F:\\Demo\\run\\server'

export const checksumHandler = (ws, serverChecksumsMap, relativePath, folderPath) => {
  const clientChecksumsMap = new Map()
  const { state } = checkExitDiff(serverChecksumsMap, clientChecksumsMap, relativePath, folderPath)
  if (!state) {
    // 1、创建临时目录
    const { tempFolderPath, folderName } = getTempFolder()
    // 2、存储不需要同步的文件路径信息
    const noSyncFileSets = []
    // 3、处理消息，获取最终差异文件zip包路径
    dealCheckSumsMsg(tempFolderPath, serverChecksumsMap, clientChecksumsMap, noSyncFileSets)
    sendFileWebSocket(ws, tempFolderPath, folderName, noSyncFileSets)
    // TODO: 删除临时目录
  } else {
    console.log('没有文件变动，无需同步')
  }
}

// 创建临时文件夹
const getTempFolder = () => {
  const folderName = `diff-${new Date().getTime()}`
  const tempFolderPath = `${getStoreKey(ROOT_KEY)}/${TEMP_FOLDER_NAME}/${folderName}`
  if (fileExistsSync(tempFolderPath)) {
    fileRmdirSync(tempFolderPath)
  }
  createFolderByPath(tempFolderPath)

  return { tempFolderPath, folderName }
}

// 发送websocket
const sendFileWebSocket = async (ws, tempFolderPath, folderName, noSyncFileSets) => {
  await zipFolder(tempFolderPath, tempFolderPath + '.zip')
  const fileLength = getFileSize(tempFolderPath + '.zip')
  console.log(noSyncFileSets, 'setNoSyncFileSets')
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
      noSyncFileSets
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
    // 服务器存在，本地也存在
    if (serverChecksumsMap.has(fileName)) {
      if (arraysAreEqual(serverChecksumsMap.get(fileName).checksum, clientChecksum.checksum)) {
        noSyncFileSets.push(fileName)
      } else {
        const diffList = rollGetDiff(serverChecksumsMap.get(fileName), fileName)
        generateDiffFileOnTempFolder(diffList, tempFolderPath, fileName, noSyncFileSets)
      }
    } else {
      // 本地存在，服务器不存在
      generateDiffFileOnTempFolder([], tempFolderPath, fileName, noSyncFileSets)
    }
  }
}

const generateDiffFileOnTempFolder = (diffList, tempFolderPath, fileName) => {
  if (diffList.length) {
    createRsyncFile(diffList, tempFolderPath, fileName)
  } else {
    const tempFilePath = `${tempFolderPath}/${fileName}`
    const syncFilePath = `${getStoreKey(ROOT_KEY)}//${fileName}`
    copyFileInDeepFolderSync(syncFilePath, tempFilePath)
  }
}

const createRsyncFile = (diffList, tempFolderPath, fileName) => {
  const filePath = `${tempFolderPath}/${fileName}`
  fs.appendFileSync(filePath, intToByte(CHUNK_SIZE, 4))
  for (const diff of diffList) {
    if (diff.isMatch) {
      fs.appendFileSync(filePath, intToByte(IS_SAME_BLOCK, 1))
      fs.appendFileSync(filePath, intToByte(diff.index, 4))
    } else {
      fs.appendFileSync(filePath, intToByte(IS_DIFF_BLOCK, 1))

      const len = diff.data.length
      fs.appendFileSync(filePath, intToByte(len, 4))
      fs.appendFileSync(filePath, diff.data)
    }
  }
}

const formateClientChecksumsMap = (clientChecksumsMap) => {
  for (const [key, checksum] of clientChecksumsMap.entries()) {
    clientChecksumsMap.set(key, {
      checksum,
      blockChecksums: generateBlockChecksums(`${getStoreKey(ROOT_KEY)}/${SYNC_FOLDER_NAME}/${key}`)
    })
  }
}

export const rollGetDiff = (serverChecksum, fileName) => {
  const diffList = []
  const filePath = `${getStoreKey(ROOT_KEY)}/${SYNC_FOLDER_NAME}/${fileName}`
  const srcMap = convert2Map(serverChecksum)
  let fileOffset = 0
  const fileBuffer = fs.readFileSync(filePath)
  const fileLength = fileBuffer.length

  while (fileOffset < fileLength) {
    const bytesLength =
      fileLength - fileOffset > Math.pow(2, 31) - 1 ? Math.pow(2, 31) - 1 : fileLength - fileOffset

    let byteOffset = 0

    // 滚动计算
    const roll = new RollChecksum()
    while (byteOffset < bytesLength) {
      let start = byteOffset
      let index
      // 计算初始校验和
      roll.reset()
      roll.update(getBuffer(fileBuffer, start, CHUNK_SIZE))
      index = checkSame(roll.getValue(), start, srcMap, fileBuffer)
      // 没有匹配，滚动计算
      if (index === -1) {
        while (++start < bytesLength - CHUNK_SIZE + 1) {
          roll.updateBytes(
            getBuffer(fileBuffer, start - 1, 1),
            getBuffer(fileBuffer, start + CHUNK_SIZE - 1, 1),
            CHUNK_SIZE
          )
          index = checkSame(roll.getValue(), start, srcMap, fileBuffer)
          if (index !== -1) {
            break
          }
        }
        // 没法滚动计算了，全部写入差异内容
        if (start >= bytesLength - CHUNK_SIZE + 1) {
          const data = getBuffer(fileBuffer, byteOffset, bytesLength - byteOffset)
          diffList.push({ isMatch: false, data })
          break
        }
      }
      // 存在差异内容，写入diffList
      if (start - byteOffset > 0) {
        const data = getBuffer(fileBuffer, byteOffset, start - byteOffset)

        diffList.push({ isMatch: false, data })
      }
      // 存在匹配内容，写入diffList，并跳转CHUNK_SIZE
      if (index !== -1) {
        diffList.push({ index, isMatch: true })
      }
      byteOffset = start + CHUNK_SIZE
    }

    fileOffset += bytesLength
  }
  return diffList
}

const checkSame = (weak, start, srcMap, fileBuffer) => {
  if (srcMap.has(weak)) {
    const item = srcMap.get(weak)
    const strongChecksum = calculateFileHash(getBuffer(fileBuffer, start, CHUNK_SIZE))
    if (arraysAreEqual(item.strongChecksum, strongChecksum)) {
      return item.index
    }
  }
  return -1
}

const convert2Map = (serverChecksum) => {
  const map = new Map()
  for (const blockChecksum of serverChecksum.blockChecksums) {
    map.set(blockChecksum.weakChecksum, blockChecksum)
  }
  return map
}
