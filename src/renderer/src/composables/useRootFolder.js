import { onMounted } from 'vue'
import { useMessage } from 'naive-ui'
import { useRouterPush } from '@hooks'
import { ROOT_KEY } from '@/common'

export const useRootFolder = () => {
  onMounted(async () => {
    const message = useMessage()
    const { routerPush } = useRouterPush()

    const folderPath = await window.electronAPI.getStoreKey(ROOT_KEY)
    if (folderPath) {
      const isExists = await window.electronAPI.fileExistsSync(folderPath)
      if (!isExists) {
        message.error('文件不存在或被改名')
        routerPush('/')
      }
    }
  })
}
