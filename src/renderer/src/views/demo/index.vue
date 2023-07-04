<script setup>
import { onMounted, ref } from 'vue'
import { NButton, useMessage } from 'naive-ui'
// import { useRouterPush } from '@hooks'
import { ROOT_KEY } from '@/common'
const message = useMessage()
// const { routerPush } = useRouterPush()

const folderPath = ref(null)
onMounted(async () => {
  folderPath.value = await window.electronAPI.getStoreKey(ROOT_KEY)
  if (folderPath.value) {
    const isExists = await window.electronAPI.fileExistsSync(folderPath.value)
    if (isExists) {
      window.electronAPI.initWebSocket(folderPath.value)
      // routerPush('draftList')
    } else {
      folderPath.value = null
      message.error('文件不存在或被改名')
    }
  }
})

const handleGetFolderPath = async () => {
  await window.electronAPI.createRootFolder()
  folderPath.value = await window.electronAPI.getStoreKey(ROOT_KEY)
  window.electronAPI.initWebSocket(folderPath.value)
  message.success('选择成功')
}
const syncData2Client = async () => {
  await window.electronAPI.syncData2Client()
  message.success('同步服务器文件到本地')
}

const syncData2Server = async () => {
  await window.electronAPI.syncData2Server()
  message.success('同步本地文件到服务器')
}
</script>

<template>
  <div class="container">
    <p>提示：请选择一个目录作为跟目录</p>
    <n-button style="margin-bottom: 10px" @click="handleGetFolderPath">get folder path</n-button>
    <template v-if="folderPath">
      <n-button style="margin-bottom: 10px" @click="syncData2Server">同步本地文件到服务器</n-button>
      <n-button @click="syncData2Client">同步服务器文件到本地</n-button>
    </template>
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
