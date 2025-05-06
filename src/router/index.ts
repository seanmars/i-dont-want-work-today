import {createRouter, createWebHistory} from 'vue-router'
import Layout from '../components/Layout.vue'

const routes = [
    {
        path: '/',
        component: Layout,
        children: [
            {
                path: '',
                name: 'home',
                component: () => import('../pages/Home.vue')
            },
            {
                path: 'leave',
                name: 'leave',
                component: () => import('../pages/Leave.vue')
            }
        ]
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
