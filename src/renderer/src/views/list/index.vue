<template>
  <n-button @click="handClick">click</n-button>
  <n-data-table :columns="columns" :data="data" :bordered="false" />
</template>

<script setup>
import { h, ref } from 'vue'
import { NButton, NDataTable } from 'naive-ui'
import { ROOT_KEY } from '@/common'
import { useRouterPush, useRootFolder } from '@hooks'

const { routerPush } = useRouterPush()
useRootFolder()

const columns = ref([
  {
    title: 'No',
    key: 'no'
  },
  {
    title: 'Title',
    key: 'title'
  },
  {
    title: 'Length',
    key: 'length'
  },
  {
    title: 'Action',
    key: 'actions',
    render(row) {
      return h(
        NButton,
        {
          strong: true,
          tertiary: true,
          size: 'small',
          onClick: () => chose(row)
        },
        { default: () => '查看' }
      )
    }
  }
])

const chose = async ({ no }) => {
  // 选中某一个底稿文件夹
  window.electronAPI.choseDraft(no)
  const folderPath = `${await window.electronAPI.getStoreKey(ROOT_KEY)}/${no}`
  const isExist = await window.electronAPI.fileExistsSync(folderPath)
  if (!isExist) {
    await window.electronAPI.createFolderByPath(folderPath)
  }
  routerPush('/detail')
}

const data = ref([
  { no: 1, title: '底稿1', length: '4:18' },
  { no: 2, title: '底稿2', length: '4:48' },
  { no: 3, title: '底稿3', length: '7:27' }
])

const handClick = async () => {
  await window.electronAPI.changePermissionsRecursive(
    await window.electronAPI.getStoreKey(ROOT_KEY),
    'r'
  )
}
</script>
