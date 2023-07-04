import fs from 'fs'
import { calculateFileHash, calculateFileHashByPath, RollChecksum } from '../md5'
import { CHUNK_SIZE } from '../constants'
import { isDirectory } from '../file'
import { getRelativePath } from '@/utils'

export const genAllCheckSums = (folderPath, relative, checksumsMap) => {
  if (isDirectory(folderPath)) {
    const files = fs.readdirSync(folderPath).filter((v) => !v.startsWith('.'))
    for (const file of files) {
      const absolutePath = `${folderPath}/${file}`
      if (isDirectory(absolutePath)) {
        genAllCheckSums(absolutePath, relative, checksumsMap)
      } else {
        const name = getRelativePath(absolutePath, relative)
        if (name !== '') {
          checksumsMap[name] = {
            blockChecksums: genFileCheckSums({ name, filePath: absolutePath })
          }
        }
      }
    }
  }
}
export const genFileCheckSums = ({ name, filePath }) => {
  return {
    name,
    checksum: calculateFileHashByPath(filePath),
    blockChecksums: generateBlockChecksums(filePath)
  }
}

export const generateBlockChecksums = (filePath) => {
  let list = []
  const allData = fs.readFileSync(filePath)
  // 读取数据的起始位置
  let position = 0

  // 开始读取第一段数据
  readChunk(allData, position, list)

  return list
}

// 分段读取文件内容
const readChunk = (allData, offset, list) => {
  const length = allData.length

  while (offset < length) {
    // 处理读取的数据
    list.push(genBlockChecksums({ allData, index: list.length, offset }))

    // 更新下次读取的起始位置
    offset += CHUNK_SIZE
  }
}

export const genBlockChecksums = ({ allData, index, offset }) => {
  const buf = allData.slice(offset, offset + CHUNK_SIZE)
  return {
    strongChecksum: calculateFileHash(buf),
    weakChecksum: new RollChecksum().update(buf).getValue(),
    index,
    offset,
    size: buf.length
  }
}
