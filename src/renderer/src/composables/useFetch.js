import { computed, unref } from 'vue'
import { createFetch } from '@vueuse/core'
import qs from 'qs'

export const useMyFetch = createFetch({
  options: {
    async beforeFetch({ options }) {
      const myToken = 'my-token'
      options.headers.Authorization = `Bearer ${myToken}`

      return { options }
    }
  },
  fetchOptions: {
    mode: 'cors'
  }
})

export const usePostFetch = (url, body) => {
  return useMyFetch(url, { immediate: true, refetch: true }).post(body).json()
}

export const useGetFetch = (url, body) => {
  const reqUrl = computed(() => {
    return `${unref(url)}?${qs.stringify(unref(body))}`
  })
  return useMyFetch(reqUrl, { immediate: true, refetch: true }).get().json()
}
