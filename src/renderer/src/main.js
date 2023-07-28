import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'

import 'element-plus/dist/index.css'

import './css/public.scss'
import App from './App.vue'
import router from './router'

createApp(App).use(ElementPlus, { zIndex: 3000, locale: zhCn }).use(router).mount('#app')
