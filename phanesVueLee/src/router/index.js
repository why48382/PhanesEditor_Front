import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: "/editor", component: () => import("../views/EdirotFrame.vue") },
    { path: "/", component: () => import("../views/Index.vue") },
    { path: "/profile", component: () => import("../views/Profile.vue") }

  ],
})

export default router
