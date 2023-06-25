<template>
  <n-button @click="routerBack">back</n-button>
  <n-tree
    block-line
    :data="data"
    :default-expanded-keys="defaultExpandedKeys"
    :selectable="false"
  />
</template>

<script setup>
import { h, ref } from 'vue'
import { repeat } from 'seemly'
import { NButton, NTree, useMessage } from 'naive-ui'
import { useRouterPush } from '@hooks'
const { routerBack } = useRouterPush()

const message = useMessage()

const handleClickOpenFile = () => {
  message.success('选择成功')
  // TODO 下载文件
  window.electronAPI.openFileByPath('/Users/linchuanke/Downloads/rrrrr.docx')
}

const handleCLickDel = () => {
  message.success('删除成功')
}

function createData(level = 2, baseKey = '') {
  if (!level) return void 0
  return repeat(6 - level, void 0).map((_, index) => {
    const key = '' + baseKey + level + index
    const label = createLabel(level)
    return {
      label,
      key,
      children: createData(level - 1, key),
      suffix: () =>
        h('div', [
          h(
            NButton,
            { text: true, type: 'primary', onClick: () => handleClickOpenFile() },
            { default: () => '查看' }
          ),
          h(
            NButton,
            {
              text: true,
              type: 'primary',
              style: 'margin-left: 12px',
              onClick: () => handleCLickDel()
            },
            { default: () => '删除' }
          )
        ])
    }
  })
}

function createLabel(level) {
  if (level === 2) return '目录'
  if (level === 1) return '文件'
  return ''
}

const data = createData()
const defaultExpandedKeys = ref(['40', '41'])
</script>
