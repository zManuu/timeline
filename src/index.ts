import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import Home from './components/Home.vue'

const routes: Array<RouteRecordRaw> = [
  { path: '/', component: Home }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
