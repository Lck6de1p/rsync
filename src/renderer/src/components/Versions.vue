<script setup>
import { ref } from 'vue'

const title = ref('')

const handleSend = () => {
  window.electronAPI.setTitle(title.value)
}

const handleGetFilePath = async () => {
  console.log(window.electronAPI, 'api')
  const path = await window.electronAPI.openFile()
  console.log(path)
}

const handleUpdate = async () => {
  await window.electronAPI.updateFile()
  console.log('ok')
}

const handleChangeStatus = async (status) => {
  await window.electronAPI.changeFileStatus(status)
  console.log('ok')
}

const calMd5Time = async () => {
  await window.electronAPI.calMd5Time()
}
</script>

<template>
  <ul class="versions">
    <input v-model="title" type="text" />
    <button @click="handleSend">click</button>
    <button @click="handleGetFilePath">get file path</button>
    <button @click="handleUpdate">update</button>

    <button @click="handleChangeStatus('r')">readonly</button>
    <button @click="handleChangeStatus('rw')">read & write</button>
    <button @click="calMd5Time">calMd5Time</button>
    <!-- <button @click="handleUpdate">update</button> -->
  </ul>
</template>
