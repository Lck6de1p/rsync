import { dialog, shell } from 'electron'
import fs from 'fs'
import path, { join } from 'path'
import store from './store'
import { ROOT_KEY, ROOT_FOLDER_NAME } from '@/common/index.js'
import { TEMP_FOLDER_NAME, SYNC_FOLDER_NAME } from './constants'
// 通过对话框选择文件夹并创建root文件夹
const createRootFolder = async () => {
  // 打开文件夹选择对话框
  const res = await dialog.showOpenDialog({ properties: ['openDirectory'] })

  if (!res.canceled) {
    let folderPath = `${res.filePaths[0]}/${ROOT_FOLDER_NAME}`
    store.set(ROOT_KEY, folderPath)
    initRootFolder(folderPath)
  }
}

// 初始化根文件夹
const initRootFolder = (folderPath) => {
  fs.mkdirSync(`${folderPath}/${TEMP_FOLDER_NAME}`, { recursive: true })
  fs.mkdirSync(`${folderPath}/${SYNC_FOLDER_NAME}`, { recursive: true })
}

// 是否为文件夹

const isDirectory = (folderPath) => {
  const stats = fs.statSync(folderPath)
  return stats.isDirectory()
}

// 查看文件夹是否存在
const fileExistsSync = (filePath) => {
  return fs.existsSync(filePath)
}

// 删除文件夹
const fileRmdirSync = (filePath) => {
  fs.rmdirSync(filePath)
}

// 创建文件夹
function createFolderByPath(folderPath) {
  fs.mkdirSync(folderPath)
}

// 获取文件二进制长度
const getFileSize = (filePath) => {
  return fs.statSync(filePath).size
}
const map = {
  r: 0o400,
  rw: 0o777
}
// 修改文件夹下所有文件的权限
function changePermissionsRecursive(event, folderPath, mode) {
  console.log(folderPath, mode)
  // 读取目录下的所有文件和子目录
  const files = fs.readdirSync(folderPath)

  files.forEach((file) => {
    const filePath = join(folderPath, file)
    const stats = fs.statSync(filePath)

    if (stats.isDirectory()) {
      // 如果是子目录，则递归调用该函数
      changePermissionsRecursive(filePath, map[mode])
    } else {
      // 如果是文件，则修改权限
      fs.chmodSync(filePath, map[mode])
    }
  })
}

// 根据目录打开某个文件
const openFileByPath = (event, filePath) => {
  shell
    .openPath(filePath)
    .then(() => {
      console.log('文件已成功打开')
    })
    .catch((error) => {
      console.error('打开文件时出错:', error)
    })
}

// 向文件末尾写入内容

const appendFileSync = (filePath, content) => {
  fs.appendFileSync(filePath, content)
}

const writeFileSync = (filePath, content) => {
  fs.writeFileSync(filePath, content)
}

const copyFile = (src, target) => {
  fs.copyFile(src, target, () => {})
}

const deleteFileSync = (filePath) => {
  fs.unlinkSync(filePath)
}

const rename = (oldPath, newPath) => {
  fs.rename(oldPath, newPath, (err) => {
    if (err) {
      console.error(err)
      return
    }
    console.log('文件重命名成功')
  })
}

/**
 * 同步拷贝文件，若不存在文件夹路径，则创建文件夹
 * @param {*} sourceFilePath 资源文件路径
 * @param {*} targetFilePath 目标文件路径
 */
const copyFileInDeepFolderSync = (sourceFilePath, targetFilePath) => {
  const folderPath = path.dirname(targetFilePath)
  // 创建缺少的文件夹路径
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true })
  }

  // 创建文件
  fs.copyFileSync(sourceFilePath, targetFilePath)
}
export {
  createRootFolder,
  createFolderByPath,
  changePermissionsRecursive,
  openFileByPath,
  fileExistsSync,
  fileRmdirSync,
  isDirectory,
  getFileSize,
  appendFileSync,
  writeFileSync,
  copyFile,
  deleteFileSync,
  rename,
  copyFileInDeepFolderSync
}
