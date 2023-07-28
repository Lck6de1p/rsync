import { ref, onMounted } from 'vue'
import { useAddEventListener } from '@hooks'
export const useGetTableHeight = (listPageRef, ...restRef) => {
  const height = ref(null)

  const getTableHeight = () => {
    const dom = listPageRef.value
    const parentHeight = dom.parentNode.getClientRects()[0].height
    const domTop = dom.getClientRects()[0].top
    height.value =
      parentHeight -
      domTop -
      35 -
      restRef.reduce((total, pre) => {
        return total + pre.value.getClientRects()[0].height
      }, 0)
  }
  onMounted(() => {
    getTableHeight()
  })
  useAddEventListener('resize', getTableHeight)

  return {
    height
  }
}
