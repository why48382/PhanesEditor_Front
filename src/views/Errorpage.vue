<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const reason = computed(() => route.query.reason || 'unknown')

const messages = {
    unauthorized: {
        title: '세션이 만료됐어요',
        desc: '로그인이 풀렸거나 인증 정보가 유효하지 않아요. 다시 로그인해주세요.'
    },
    unknown: {
        title: '문제가 발생했어요',
        desc: '요청을 처리하는 중 오류가 발생했어요. 잠시 후 다시 시도해주세요.'
    }
}

const current = computed(() => messages[reason.value] || messages.unknown)

const goLogin = () => {
    router.push({ name: 'login' })
}

const goHome = () => {
    router.push({ name: 'main' })
}
</script>

<template>
    <div class="error-page">
        <div class="error-card">
            <p class="error-code">Phanes Editor</p>
            <h1 class="error-title">{{ current.title }}</h1>
            <p class="error-desc">{{ current.desc }}</p>
            <div class="error-actions">
                <button class="btn primary" @click="goLogin">로그인하러 가기</button>
                <button class="btn" @click="goHome">홈으로</button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.error-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f8f5f2;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.error-card {
    background: #ffffff;
    border: 1px solid #e5e5e5;
    border-radius: 12px;
    padding: 48px 40px;
    text-align: center;
    max-width: 420px;
    width: 90%;
}

.error-code {
    font-size: 13px;
    color: #9ca3af;
    letter-spacing: 1px;
    margin: 0 0 16px;
}

.error-title {
    font-size: 22px;
    font-weight: 700;
    color: #111827;
    margin: 0 0 12px;
}

.error-desc {
    font-size: 14px;
    color: #6b7280;
    line-height: 1.6;
    margin: 0 0 28px;
}

.error-actions {
    display: flex;
    gap: 10px;
    justify-content: center;
}

.btn {
    padding: 10px 20px;
    border-radius: 9999px;
    border: 1px solid #d1d5db;
    background: #ffffff;
    color: #374151;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
}

.btn:hover {
    background-color: #f3f4f6;
}

.btn.primary {
    background-color: #111827;
    color: #ffffff;
    border-color: #111827;
}

.btn.primary:hover {
    background-color: #1f2937;
}
</style>