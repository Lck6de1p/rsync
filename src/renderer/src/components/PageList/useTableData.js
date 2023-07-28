import { ref, computed, watch } from 'vue'
import { useGetFetch, usePostFetch } from '@hooks'
export const useTableData = (props, formData, page, setTotal) => {
  if (!props.request) {
    return useSearchInLocal(props, formData, page, setTotal)
  } else {
    return useFetchSearch(props, formData, page, setTotal)
  }
}

// 传入tableData 前端分页
const useSearchInLocal = (props, formData, page, setTotal) => {
  const filterData = computed(() => {
    const searchs = Object.entries(formData.value)
    return props.tableData.filter((item) => {
      return searchs.every(([key, value]) => {
        return item[key] == value
      })
    })
  })
  watch(
    filterData,
    (val) => {
      setTotal(val.length)
    },
    { deep: true, immediate: true }
  )
  return computed(() => {
    const { currentPage, pageSize } = page
    return filterData.value.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  })
}

// table数据从后端获取
const useFetchSearch = (props, formData, page, setTotal) => {
  const searchForm = computed(() => {
    return { ...formData.value, ...page, ...props.initFormData }
  })

  let data
  const tableData = ref([])
  switch (props.methods) {
    case 'post':
      data = usePostFetch(props.request, searchForm).data
      break
    case 'get':
      data = useGetFetch(props.request, searchForm).data
      break
  }
  watch(
    () => data.value,
    (newValue) => {
      setTotal(newValue.total)
      tableData.value = newValue.data
    }
  )

  return tableData
}
