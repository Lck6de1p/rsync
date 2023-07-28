import { defineComponent } from 'vue'
export default defineComponent({
  props: {
    ctx: {
      type: Object
    },
    render: {
      type: Function
    }
  },
  setup(props) {
    // 返回渲染函数
    return props.render
  }
})
