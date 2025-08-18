<!-- isLogin 값을 false 할 경우 로그인 된 상태 -->

<script setup>
import { ref, reactive, onMounted } from 'vue'
import sidebar from '@/components/SideBar.vue'
import api from '@/api/user/user_index'
import { useRouter } from 'vue-router'
import useUserStore from '@/stores/useUserStore'

const userStore = useUserStore();
const router = useRouter();

const openMypage = async () => {
    const data = await api.userMypage();
    if (data && data.success) {
        router.push({ name: 'profile' })
        // alert("응답 성공")
    } else {
        // alert("응답 실패")
    }


}

const logOut = async () => {
    const data = await api.logOut();
    if (data && data.success) {
        isLogin.value = true;
        router.push({ name: 'main' })
        alert("응답 성공")
    } else {
        alert("응답 실패")
    }
}


</script>


<template>
    <div>
        <div v v-if="!userStore.loginCheck()">
            <nav class="navbar">
                <router-link :to="{ name: 'login' }"><button class="login-btn">로그인</button></router-link>
                <router-link :to="{ name: 'signup' }"><button class="login-btn">회원가입</button></router-link>
            </nav>
        </div>
        <div v v-else>
            <nav class="navbar">
                <button @click="openMypage" class="login-btn">mypage</button>
                <button @click="logOut" class="login-btn">로그아웃</button>
            </nav>
            <sidebar></sidebar>

        </div>

        <div class="main-container">
            <div class="main-title">Phanes</div>
            <input type="text" class="url-input" placeholder="URL을 입력하세요">
        </div>
    </div>

</template>




<style scoped>
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    background-color: #ffffff;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
}

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

.navbar a {
    text-decoration: none;
    color: #1f2937;
    transition: color 0.2s;
}

.navbar a:hover {
    color: #3B82F6;
}

.login-btn {
    padding: 6px 16px;
    border: 1px solid #d1d5db;
    border-radius: 9999px;
    cursor: pointer;
    transition: background-color 0.2s, color 0.2s;
    font-size: 12px;
}

.login-btn:hover {
    background-color: #f3f4f6;
}

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

.url-input {
    padding: 12px 24px;
    border: 1px solid #e5e7eb;
    border-radius: 9999px;
    outline: none;
    width: 250px;
    font-size: 14px;
    color: #6b7280;
}

.url-input::placeholder {
    color: #9ca3af;
}
</style>
