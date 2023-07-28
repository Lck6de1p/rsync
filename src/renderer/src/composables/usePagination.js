import { reactive, ref } from 'vue'
export const usePagination = () => {
  const page = reactive({
    pageSize: 100,
    currentPage: 1
  })
  const totalCount = ref(0)

  const setSize = (e) => {
    page.pageSize = e
  }
  const setCurrent = (e) => {
    page.currentPage = e
  }

  const setTotal = (total) => {
    totalCount.value = total
  }

  return {
    page,
    totalCount,
    setCurrent,
    setSize,
    setTotal
  }
}
