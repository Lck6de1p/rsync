<template>
  <div ref="drag" :class="['drag', { 'drag-active': active }]">
    <p class="drag-title">未选择文件/文件夹</p>
    <p class="drag-subtile">
      支持拖拽到此区域上传，支持选择多个文件/文件夹
      <br />
      单个文件夹最大支持512GB
    </p>
  </div>
</template>
<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
const drag = ref(null)
const active = ref(false)
onMounted(() => {
  drag.value.addEventListener('drop', handleDrop)
  drag.value.addEventListener('dragleave', (e) => {
    active.value = false
    e.preventDefault()
  })
  drag.value.addEventListener('dragenter', (e) => {
    active.value = true
    e.preventDefault()
  })
  drag.value.addEventListener('dragover', (e) => {
    active.value = true
    e.preventDefault()
  })
})

onBeforeUnmount(() => {
  drag.value.removeEventListener('drop', handleDrop)
})

const emit = defineEmits(['file'])
const handleDrop = (e) => {
  e.preventDefault()
  active.value = false
  console.log(Array.from(e.dataTransfer.files))
  emit('file', Array.from(e.dataTransfer.files))
}
</script>

<style lang="scss" scoped>
.drag {
  height: 220px;
  border: 1px dashed #dedede;
  border-radius: 4px;
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;

  &-active {
    border: 1px dashed #2260ff;
  }

  &-title {
    font-size: 14px;
  }

  &-subtile {
    font-size: 12px;
    color: #999999;
    margin-top: 30px;
    text-align: center;
    line-height: unset;
  }
}
</style>
