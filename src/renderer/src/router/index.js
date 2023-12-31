import { createRouter, createWebHashHistory } from 'vue-router'
import Demo from '@views/demo/index.vue'
import List from '@views/list/index.vue'
import Detail from '@views/detail/index.vue'

const routes = [
  { path: '/', component: Demo },
  { path: '/draftList', component: List },
  { path: '/detail', component: Detail }
]

const router = createRouter({
  routes,
  history: createWebHashHistory()
})

export default router
