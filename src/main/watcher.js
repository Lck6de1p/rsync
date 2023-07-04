import chokidar from 'chokidar'
class Watcher {
  constructor(folderPath) {
    this.folderPath = folderPath
    this.isReady = false
    this.watcher = chokidar.watch(folderPath, {
      ignored: /(^|[/\\])\../, // ignore dotfiles

      persistent: true
    })
    // 监听文件添加事件
    this.watcher
      // .on("addDir", (path) => log(`Directory ${path} has been added`))
      // .on("unlinkDir", (path) => log(`Directory ${path} has been removed`))
      // .on("error", (error) => log(`Watcher error: ${error}`))
      .on('ready', () => (this.isReady = true))
      .on('unlink', (path) => log(`file ${path} has been removed`)
      .on('raw', (event, path, details) => {
        // internal
        if (this.isReady) {
          console.log('Raw event info:', event, path, details)

          switch (event) {
            case 'addDir':
              console.log('添加文件夹')
            case 'unlinkDir':
              console.log('删除文件夹')
            case 'addDir':
              console.log('添加文件夹')
              break

            default:
              break
          }
        }
      })
  }
  close() {
    this.watcher.close()
  }
}

export default Watcher
