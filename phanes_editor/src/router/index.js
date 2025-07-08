import CreateProjectPage from '@/views/CreateProjectView.vue'
import EditorView from '@/views/EditorView.vue'
import LandingView from '@/views/LandingView.vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Landing',
      component: LandingView,
    },
    {
      path: '/create',
      name: 'Create',
      component: CreateProjectPage,
    },
    {
      path: '/editor',
      name: 'Editor',
      component: EditorView,
    },
    // Lazy Loading  : () => import("파일 경로")
    { path: "/create", component: () => import("@/views/CreateProjectView.vue") },
    {
      path: "/editor", component: () => import("@/views/EditorView.vue"),
      children: [
      ],
    },
    {
      path: "/signup", component: () => import("@/views/SignUpView.vue"),
      children: [
      ],
    },
    // { path: "/member/login", component: () => import('@/views/member/Login.vue') },
  ]
})

export default router
