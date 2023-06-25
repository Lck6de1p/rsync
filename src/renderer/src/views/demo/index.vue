<script setup>
import { onMounted } from 'vue'
import { NButton, useMessage } from 'naive-ui'
import { useRouterPush } from '@hooks'
import { ROOT_KEY } from '@/common'
const message = useMessage()
const { routerPush } = useRouterPush()

onMounted(async () => {
  const folderPath = await window.electronAPI.getStoreKey(ROOT_KEY)
  if (folderPath) {
    const isExists = await window.electronAPI.fileExistsSync(folderPath)
    if (isExists) {
      routerPush('draftList')
    } else {
      message.error('文件不存在或被改名')
    }
  }
})

const handleGetFolderPath = async () => {
  await window.electronAPI.createRootFolder()
  routerPush('draftList')
  message.success('选择成功')
}
</script>

<template>
  <div class="container">
    <p>提示：请选择一个目录作为跟目录</p>
    <n-button @click="handleGetFolderPath">get folder path</n-button>
  </div>
</template>
<style lang="less" scoped>
.container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}
</style>
