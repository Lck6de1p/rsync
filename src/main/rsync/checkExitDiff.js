import { calculateFileHashByPath } from '../md5'
import { arraysAreEqual } from '@/utils/array'
export const checkExitDiff = (serverChecksumsMap, files, folderRootKey) => {
  const clientChecksumsMap = new Map()

  for (const file of files) {
    clientChecksumsMap.set(file, calculateFileHashByPath(`${folderRootKey}/${file}`))
  }
  if (serverChecksumsMap.size !== clientChecksumsMap.size) {
    return { state: false, clientChecksumsMap }
  }

  for (let [key, value] of serverChecksumsMap.entries()) {
    const clientChecksumsVal = clientChecksumsMap.get(key)
    if (!clientChecksumsVal || !arraysAreEqual(value.checksum, clientChecksumsVal)) {
      return { state: false, clientChecksumsMap }
    }
  }
  return { state: true, clientChecksumsMap }
}
