export function intToByte(i, len) {
  let byteArr = Buffer.alloc(len)
  for (let j = 0; j < byteArr.length; j++) {
    byteArr[j] = (i >>> ((len - j - 1) * 8)) & 0xff
  }
  return byteArr
}
