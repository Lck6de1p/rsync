<script setup>
import { NMessageProvider } from 'naive-ui'
import { RouterView } from 'vue-router'
// import Versions from './components/Versions.vue'
</script>

<template>
  <n-message-provider>
    <RouterView />
    <!-- <Versions></Versions> -->
  </n-message-provider>
</template>
