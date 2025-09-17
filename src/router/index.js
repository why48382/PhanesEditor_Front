import { createRouter, createWebHistory } from 'vue-router'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: "/", name: 'main', component: () => import("@/views/Index.vue") },
    { path: "/user/login", name: 'login', component: () => import("@/views/user/Login.vue") },
    { path: "/user/signup", name: 'signup', component: () => import("@/views/user/Signup.vue") },
    { path: "/user/profile", name: 'profile', component: () => import("@/views/user/Profile.vue") },
    { path: "/user/profile/edit", name: 'profileEdit', component: () => import("@/views/user/ProfileUpdate.vue") },
    { path: "/project/editor/:id", name: "editor", component: () => import("@/views/project/ProjectPage.vue") }, // 파라미터를 받게 변경
    { path: "/project/create", name: 'projectCreate', component: () => import("@/views/project/CreateProject.vue") },
    { path: "/project/search", name: 'search', component: () => import("@/components/project/Search.vue") },
    { path: "/oauth2/success", name: 'oauth2Success', component: () => import("@/views/OAuth2Success.vue") },
    { path: "/test", component: () => import("@/views/Test.vue") },
    { path: "/health", component: () => import("@/views/Health.vue") },
  ],
})

export default router
