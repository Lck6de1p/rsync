export const intToByte = (i, len) => {
  let byteArr = Buffer.alloc(len)
  for (let j = 0; j < byteArr.length; j++) {
    byteArr[j] = (i >>> ((len - j - 1) * 8)) & 0xff
  }
  return byteArr
}

export const bytesToInt = (bytes) => {
  let addr = 0
  for (let i = 0; i < bytes.length; i++) {
    addr = (addr << 8) | (bytes[i] & 0xff)
  }
  return addr
}

export const getBuffer = (allData, start, len) => {
  return allData.slice(start, len + start)
}
