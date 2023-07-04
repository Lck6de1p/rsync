import fs from 'fs'
import { calculateFileHashByPath } from '../md5'
import { arraysAreEqual, getRelativePath } from '@/utils'
import { isDirectory } from '../file'
export const checkExitDiff = (serverChecksumsMap, clientChecksumsMap, relative, path) => {
  if (isDirectory(path)) {
    // 读取指定文件夹下的所有文件
    const files = fs.readdirSync(path).filter((v) => !v.startsWith('.'))
    for (const file of files) {
      const absolutePath = `${path}/${file}`

      const relativePath = getRelativePath(absolutePath, relative)
      if (relativePath !== '') {
        if (isDirectory(absolutePath)) {
          checkExitDiff(serverChecksumsMap, clientChecksumsMap, relative, absolutePath)
        } else {
          clientChecksumsMap.set(relativePath, calculateFileHashByPath(absolutePath))
        }
      }
    }
  }

  if (serverChecksumsMap.size !== clientChecksumsMap.size) {
    return { state: false }
  }

  for (let [key, value] of serverChecksumsMap.entries()) {
    const clientChecksumsVal = clientChecksumsMap.get(key)
    if (!clientChecksumsVal || !arraysAreEqual(value.checksum, clientChecksumsVal)) {
      return { state: false }
    }
  }
  return { state: true }
}
