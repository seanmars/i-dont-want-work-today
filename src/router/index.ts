import { createRouter, createMemoryHistory } from 'vue-router'
import Layout from '../components/Layout.vue'

export const constantRoutes = [
    {
        title: '首頁',
        name: 'home',
        path: '/',
        component: () => import('../pages/Home.vue')
    },
    {
        title: '請假申請',
        name: 'leave',
        path: '/leave',
        component: () => import('../pages/Leave.vue')
    },
    {
        title: 'Bit Tool',
        name: 'bit-tool',
        path: '/bit-tool',
        component: () => import('../pages/BitTool.vue')
    },
];

const routes = [
    {
        path: '/',
        component: Layout,
        children: constantRoutes
    }
]

const router = createRouter({
    history: createMemoryHistory(),
    routes
})

export default router
