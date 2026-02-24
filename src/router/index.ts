import { createRouter, createWebHashHistory } from 'vue-router'
import Layout from '../components/LayoutComponent.vue'

export const constantRoutes = [
  {
    title: '首頁',
    name: 'home',
    path: '/',
    component: () => import('../views/HomeView.vue'),
  },
  {
    title: '請假申請',
    name: 'leave',
    path: '/leave',
    component: () => import('../views/LeaveView.vue'),
  },
  {
    title: 'Bit Tool',
    name: 'bit-tool',
    path: '/bit-tool',
    component: () => import('../views/BitToolView.vue'),
  },
]

const routes = [
  {
    path: '/',
    component: Layout,
    children: constantRoutes,
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router
