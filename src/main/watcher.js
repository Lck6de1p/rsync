import chokidar from 'chokidar'
import fs from 'fs'
// // 监听文件修改事件
// watcher.on('change', (filePath) => {
//   console.log(`文件修改: ${filePath}`)
// })

// // 监听文件删除事件
// watcher.on('unlink', (filePath) => {
//   console.log(`文件删除: ${filePath}`)
// })

// 监听文件夹删除事件
// watcher.on('addDir', (folderPath) => {
//   console.log(`文件夹新增: ${folderPath}`)
// })

// // 监听文件夹删除事件
// watcher.on('unlinkDir', (folderPath) => {
//   console.log(`文件夹删除: ${folderPath}`)
// })

// // 监听错误事件
// watcher.on('error', (error) => {
//   console.error(`发生错误: ${error}`)
// })

class Watcher {
  constructor(folderPath) {
    this.folderPath = folderPath
    this.watcher = chokidar.watch(folderPath, {
      persistent: true
    })
    // 监听文件添加事件
    this.watcher.on('add', (filePath) => {
      if (fs.existsSync(filePath)) {
        console.log(`File ${filePath} already exists. Skipping...`)
        return
      }
      console.log(`文件添加: ${filePath}`)
    })
  }
  close() {
    this.watcher.close()
  }
}

export default Watcher
