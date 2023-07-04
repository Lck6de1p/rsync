import fs from 'fs'
import {
  writeFileSync,
  isDirectory,
  fileExistsSync,
  createFolderByPath,
  copyFile,
  deleteFileSync,
  rename
} from '../file'
import { unzip } from '../zip'
import { bytesToInt, getBuffer, getRelativePath } from '@/utils'

import { IS_SAME_BLOCK, IS_DIFF_BLOCK, RSYNC } from '../constants'
// 暂时存放文件夹名称
let dirTempName = ''
// 暂时存放文件buffer内容
let buffer
export const saveFileName = (tempPath, name) => {
  dirTempName = name.split('.')[0]
}

export const saveFileData = (path, buf) => {
  buffer = buf
}

export const combineRsyncFile = async ({ syncFolderPath, path, noSyncFileSets }) => {
  console.log('解压时间')
  console.time('unzipTime')
  // 写入zip文件
  writeFileSync(`${path}/${dirTempName}_server.zip`, buffer)
  buffer = null
  const unzipPath = `${path}/${dirTempName}_server`
  // 解压zip包
  await unzip(`${path}/${dirTempName}_server`)
  console.timeEnd('unzipTime')

  // 服务端返回的diff zip包内容 操作
  const pathMap = new Map()
  const isDirectoryMap = new Map()
  getFileMap(unzipPath, unzipPath, pathMap, isDirectoryMap)
  const existsSet = new Set()
  combineExistsFile(syncFolderPath, syncFolderPath, pathMap, existsSet, noSyncFileSets)
  createNewFile(isDirectoryMap, unzipPath, syncFolderPath, existsSet)
}
/**
 *
 * @param {*} filepath
 * @param {*} relative
 * @param {*} pathMap
 * @param {*} isDirectoryMap  文件类型，是否为文件夹
 */
const getFileMap = (filepath, relative, pathMap, isDirectoryMap) => {
  const relativePath = getRelativePath(filepath, relative)
  if (relativePath !== '') {
    pathMap.set(relativePath, filepath)
  }
  if (isDirectory(filepath)) {
    if (relativePath !== '') {
      isDirectoryMap.set(relativePath, true)
    }
    const files = fs.readdirSync(filepath)
    for (const file of files) {
      if (file.indexOf('.') !== 0) {
        getFileMap(`${filepath}/${file}`, relative, pathMap, isDirectoryMap)
      }
    }
  } else {
    if (relativePath !== '') {
      isDirectoryMap.set(relativePath, false)
    }
  }
}
// 添加不存在的文件&&文件夹
const createNewFile = (isDirectoryMap, unzipPath, syncFolderPath, existsSet) => {
  for (const [file, isDirectory] of isDirectoryMap.entries()) {
    if (!existsSet.has(file)) {
      if (isDirectory) {
        // 文件夹
        const folderName = `${syncFolderPath}/${file}`
        if (!fileExistsSync(folderName)) {
          createFolderByPath(folderName)
        }
      } else {
        // 文件
        copyFile(`${unzipPath}/${file}`, `${syncFolderPath}/${file}`)
      }
    }
  }
}

// 合并文件
const combineExistsFile = (path, relative, pathMap, existsSet, noSyncFileSets) => {
  const relativePath = getRelativePath(path, relative)
  // TODO: 后续换成set， includes性能问题
  if (noSyncFileSets.includes(relativePath)) {
    existsSet.add(relativePath)
    return
  }
  if (isDirectory(path)) {
    const files = fs.readdirSync(path)
    if (files.length === 0) {
      // TODO:空目录操作，是否删除？ 应该是不需要的
    } else {
      for (const file of files) {
        if (file.indexOf('.') !== 0) {
          const filePath = `${path}/${file}`
          combineExistsFile(filePath, relative, pathMap, existsSet, noSyncFileSets)
        }
      }
    }
  } else {
    const rsyncFilePath = pathMap.get(relativePath)
    const sourcePath = `${relative}/${relativePath}`
    let exist = false
    if (rsyncFilePath) {
      const sourceFile = fs.readFileSync(sourcePath)
      const tempFilePath = sourcePath.replace('.', `${RSYNC}.`)

      const rsyncFile = fs.readFileSync(rsyncFilePath)
      dealCombine(tempFilePath, sourceFile, rsyncFile)

      existsSet.add(rsyncFilePath)
      deleteFileSync(sourcePath)
      rename(tempFilePath, sourcePath)
      exist = true
    }
    // 不存在进行删除
    if (!exist) {
      deleteFileSync(sourcePath)
    }
  }
}

function dealCombine(tempFilePath, sourceFile, rsyncFile) {
  try {
    const { blockSize, diffList } = file2Object(rsyncFile)
    // console.log(diffList)
    for (const item of diffList) {
      if (item.isMatch) {
        fs.appendFileSync(tempFilePath, getBuffer(sourceFile, item.index * blockSize, blockSize))
      } else {
        fs.appendFileSync(tempFilePath, item.data)
      }
    }
    console.log('文件合并完成')
  } catch (err) {
    throw new Error(err)
  }
}

const file2Object = (tmpFile) => {
  try {
    const blockSize = bytesToInt(getBuffer(tmpFile, 0, 4))

    // 文件前四位为块长度标记，所以从第五位读起
    let start = 4
    const diffList = []
    do {
      start = readBuf(tmpFile, start, diffList)
    } while (start < tmpFile.length)
    return {
      blockSize,
      diffList
    }
  } catch (err) {
    throw new Error(err)
  }
}

const readBuf = (allData, offset, diffList) => {
  const isMatch = bytesToInt(getBuffer(allData, offset, 1))
  const indexOfLen = bytesToInt(getBuffer(allData, offset + 1, 4))
  if (isMatch === IS_SAME_BLOCK) {
    diffList.push({
      isMatch: true,
      index: indexOfLen
    })
    // 一位match位置，四位index位
    return offset + 5
  } else if (isMatch === IS_DIFF_BLOCK) {
    diffList.push({
      isMatch: false,
      data: getBuffer(allData, offset + 1, indexOfLen)
    })
    return offset + 5 + indexOfLen
  }
}

// const unzipPath = `/Users/linchuanke/Downloads/temp/diff-1687929464447_server`
// const syncFolderPath = `/Users/linchuanke/Downloads/test`

// const pathMap = new Map()
// const isDirectoryMap = new Map()
// getFileMap(unzipPath, unzipPath, pathMap, isDirectoryMap)
// console.log('pathMap', pathMap)
// console.log('isDirectoryMap', isDirectoryMap)
// const existsSet = new Set()
// // TODO: 调试
// combineExistsFile(syncFolderPath, syncFolderPath, pathMap, existsSet, [])

// // ok✨
// createNewFile(isDirectoryMap, unzipPath, syncFolderPath, existsSet)
