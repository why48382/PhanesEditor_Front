<script setup>
import sidebar from '@/components/SideBar.vue'
import SearchDetailButton from '@/components/SearchDetailButton.vue'
import userApi from '@/api/user/user_index'
import projectApi from '@/api/project/project_index'
import { useRouter } from 'vue-router'
import useUserStore from '@/stores/useUserStore'
import useProjectStore from '@/stores/useProjectStore'

const userStore = useUserStore();
const projectStore = useProjectStore();
const router = useRouter();

const openMypage = async () => {
    const data = await userApi.userMypage();
    if (data && data.success) {
        userStore.setMypage(data.results)
        router.push({ name: 'profile' })
    }
}

const logOut = async () => {
    const data = await userApi.logOut();
    if (data && data.success) {
        userStore.logout();
        router.push({ name: "main" }).then(() => {
            window.location.reload();
        });
    }
}

const projectSearch = async () => {
    const data = await projectApi.projectSearch({
        name: projectStore.condition.name,
        email: projectStore.condition.email,
        language: projectStore.condition.language,
        page: projectStore.condition.page,
        size: projectStore.condition.size
    });

    if (data && data.success) {
        projectStore.setResults(data.results.content, data.totalElements);
        router.push({ name: "search" });
    }
}
</script>

<template>
    <div>
        <div v-if="!userStore.loginCheck()">
            <nav class="navbar">
                <router-link :to="{ name: 'login' }"><button class="login-btn">로그인</button></router-link>
                <router-link :to="{ name: 'signup' }"><button class="login-btn">회원가입</button></router-link>
            </nav>
        </div>
        <div v-else>
            <nav class="navbar">
                <button @click="openMypage" class="login-btn">mypage</button>
                <button @click="logOut" class="login-btn">로그아웃</button>
            </nav>
            <sidebar></sidebar>
        </div>

        <div class="main-container">
            <div class="main-title">Phanes</div>

            <!-- 검색창 + 상세검색 버튼 -->
            <div class="search-box">
                <div class="input-wrapper">
                    <input type="text" class="url-input" placeholder="프로젝트 이름을 입력하세요"
                        v-model="projectStore.condition.name" @keydown.enter.prevent="projectSearch" />
                    <button v-if="projectStore.condition.name.trim().length > 0" @click="projectSearch"
                        class="search-icon-btn">➡</button>
                </div>

                <!-- 🔥 독립된 컴포넌트 -->
                <SearchDetailButton @search="projectSearch" />
            </div>
        </div>
    </div>
</template>

<style scoped>
/* 네비게이션 */
.navbar {
    position: absolute;
    top: 0;
    right: 0;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding: 16px 32px;
    gap: 10px;
    font-size: 14px;
    font-weight: 500;
}

.login-btn {
    padding: 6px 16px;
    border: 1px solid #d1d5db;
    border-radius: 9999px;
    cursor: pointer;
    font-size: 12px;
}

.login-btn:hover {
    background-color: #f3f4f6;
}

/* 메인 */
.main-container {
    text-align: center;
    position: absolute;
    top: 35%;
    left: 50%;
    transform: translate(-50%, -50%);
}

.main-title {
    font-size: 36px;
    font-weight: bold;
    margin-bottom: 20px;
}

/* 검색창 */
.search-box {
    display: flex;
    align-items: center;
    gap: 10px;
}

.input-wrapper {
    position: relative;
    display: inline-block;
}

.url-input {
    padding: 12px 40px 12px 16px;
    border: 1px solid #e5e7eb;
    border-radius: 9999px;
    width: 280px;
    font-size: 14px;
    color: #374151;
}

.url-input:focus {
    border-color: #4f46e5;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2);
}

.url-input::placeholder {
    color: #9ca3af;
}

/* 엔터 아이콘 */
.search-icon-btn {
    position: absolute;
    top: 50%;
    right: 12px;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    color: #9ca3af;
}

.search-icon-btn:hover {
    color: #4f46e5;
}
</style>
