import { createRouter, createWebHashHistory } from 'vue-router'
import Layout from '../components/LayoutComponent.vue'

export const constantRoutes = [
  {
    title: '首頁',
    description: '挑一個工具, 早點下班.',
    name: 'home',
    path: '/',
    component: () => import('../views/HomeView.vue'),
  },
  {
    title: '請假申請',
    description: '填好表單, 產生可以直接貼上的請假訊息.',
    name: 'leave',
    path: '/leave',
    component: () => import('../views/LeaveView.vue'),
  },
  {
    title: 'Bit Tool',
    description: '在 ID, byte index 與 bit position 之間換算.',
    name: 'bit-tool',
    path: '/bit-tool',
    component: () => import('../views/BitToolView.vue'),
  },
  {
    title: 'Deep Link Tester',
    description: '解析或開啟自訂 schema 的 deep link.',
    name: 'deep-link-tester',
    path: '/deep-link-tester',
    component: () => import('../views/DeepLinkTesterView.vue'),
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
