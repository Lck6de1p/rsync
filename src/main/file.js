import { dialog, shell } from 'electron'
import fs from 'fs'
import { join } from 'path'
import store from './store'
import { ROOT_KEY, ROOT_FOLDER_NAME } from '@/common'

// 通过对话框选择文件夹并创建root文件夹
const createRootFolder = async () => {
  // 打开文件夹选择对话框
  const res = await dialog.showOpenDialog({ properties: ['openDirectory'] })

  if (!res.canceled) {
    let folderPath = `${res.filePaths[0]}/${ROOT_FOLDER_NAME}`
    createFolderByPath('', folderPath)
    store.set(ROOT_KEY, folderPath)
    return { folderPath, isEmpty: checkFolderForFiles(folderPath) }
  }
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

// 判断文件夹下是否有文件
const checkFolderForFiles = (folderPath) => {
  // 读取文件夹中的内容
  const files = fs.readdirSync(folderPath)
  return files.length === 0
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

export {
  createRootFolder,
  createFolderByPath,
  changePermissionsRecursive,
  openFileByPath,
  fileExistsSync,
  fileRmdirSync,
  isDirectory,
  getFileSize,
  appendFileSync
}
