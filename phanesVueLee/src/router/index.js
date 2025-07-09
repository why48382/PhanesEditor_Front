import { createRouter, createWebHistory } from 'vue-router'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: "/", component: () => import("@/views/Index.vue") },
    { path: "/user/login", name: 'login', component: () => import("@/views/user/Login.vue") },
    { path: "/user/signup", name: 'search', component: () => import("@/views/user/Signup.vue") },    
    { path: "/user/profile", name: 'profile', component: () => import("@/views/user/Profile.vue") },
    { path: "/project/editor", name: 'editor', component: () => import("@/views/project/ProjectPage.vue") },
    { path: "/project/create", name: 'projectCreate', component: () => import("@/views/project/CreateProject.vue") },
    { path: "/project/search", name: 'search', component: () => import("@/components/project/Search.vue") },
    { path: "/test", component: () => import("@/views/user/ProfileUpdate.vue") },
  ],
})

export default router