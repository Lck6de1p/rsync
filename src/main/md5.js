import crypto from 'crypto'
import fs from 'fs'
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

// 比较文件的哈希值
function isFileModified(filePath, previousHash) {
  const currentHash = calculateFileHash(filePath)
  return currentHash !== previousHash
}

// 示例用法

export class RollChecksum {
  constructor() {
    this.M = 65521
    this.a = 1
    this.b = 0
  }

  update(buffer) {
    for (let i = 0; i < buffer.length; i++) {
      this.a += buffer[i] & 0xff
      this.b += this.a
    }
    this.a %= this.M
    this.b %= this.M
    return this
  }

  updateByte(inByte) {
    this.a += inByte[0] & 0xff
    this.b += this.a
    this.a %= this.M
    this.b %= this.M
  }

  updateBytes(outByte, inByte, length) {
    this.a = (this.a - (outByte[0] & 0xff) + (inByte[0] & 0xff)) % this.M
    this.b = this.b - (outByte[0] & 0xff) * length + this.a - 1
    this.a %= this.M
    this.b = this.b % this.M > 0 ? this.b % this.M : this.M + (this.b % this.M)
  }

  getValue() {
    return (this.b << 16) | this.a
  }

  reset() {
    this.a = 1
    this.b = 0
  }
}
export { isFileModified, calculateFileHash, calculateFileHashByPath, calculateFileBase64ByPath }
