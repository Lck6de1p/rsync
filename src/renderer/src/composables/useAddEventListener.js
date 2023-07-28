import { onMounted, onUnmounted } from 'vue'
export const useAddEventListener = (event, cb) => {
  onMounted(() => {
    window.addEventListener(event, cb)
  })

  onUnmounted(() => {
    window.removeEventListener(event, cb)
  })
}
