import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: "/editor", component: () => import("../views/ProjectPage.vue") },
    { path: "/", component: () => import("../views/Index.vue") },
    { path: "/profile", component: () => import("../views/Profile.vue") },
    { path: "/create/project", component: () => import("../views/CreateProject.vue") },
    { path: "/search", component: () => import("@/components/Search.vue") }

  ],
})

export default router
