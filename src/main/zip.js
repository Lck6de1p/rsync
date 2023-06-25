import fs from 'fs'
import archiver from 'archiver'
export const zipFolder = (folderPath, zipFilePath) => {
  console.log('打包时间')
  console.time('zipTime')
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(zipFilePath)
    const archive = archiver('zip', {
      zlib: { level: 9 } // 最高压缩级别
    })

    output.on('close', () => {
      console.log('文件夹已成功打包为zip文件')
      console.timeEnd('zipTime')

      resolve()
    })

    archive.on('error', (err) => {
      reject(err)
    })

    archive.pipe(output)
    archive.directory(folderPath, false)
    archive.finalize()
  })
}
