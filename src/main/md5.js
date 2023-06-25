import crypto from 'crypto'
import adler32 from 'adler32'
import fs from 'fs'
import { filePath } from './common'
// 计算文件的哈希值
const calculateFileHash = (fileData) => {
  const buffer = crypto.createHash('md5').update(fileData).digest()
  const res = Array.from(buffer, (byte) => (byte < 128 ? byte : byte - 256))
  return res
}

const calculateFileHashByPath = (filePath) => {
  const fileData = fs.readFileSync(filePath)
  return calculateFileHash(fileData)
}

const calculateFileBase64ByPath = (filePath) => {
  const fileData = fs.readFileSync(filePath)
  // 计算 MD5 哈希值
  const hash = crypto.createHash('md5').update(fileData).digest()

  // 将哈希值转换为 Base64 编码的字符串
  const base64String = hash.toString('base64')
  return base64String
}

// 计算文件的Adler32值
const calculateFileAdler32 = (buffer) => {
  return adler32.sum(buffer)
}

// 比较文件的哈希值
function isFileModified(filePath, previousHash) {
  const currentHash = calculateFileHash(filePath)
  return currentHash !== previousHash
}

// 示例用法
let previousHash = calculateFileHash(filePath)

export {
  isFileModified,
  previousHash,
  calculateFileHash,
  calculateFileHashByPath,
  calculateFileAdler32,
  calculateFileBase64ByPath
}
