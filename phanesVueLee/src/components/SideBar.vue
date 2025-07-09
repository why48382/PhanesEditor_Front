<script setup>
import { ref, computed } from 'vue';

const isSidebarOpen = ref(false);

const toggleSidebar = () => {
    isSidebarOpen.value = !isSidebarOpen.value;
};

</script>

<template>
    <button class="hamburger-btn" :class="{ open: isSidebarOpen }" @click="toggleSidebar" aria-label="사이드바 열기/닫기">
        ☰
    </button>

    <aside class="sidebar" :class="{ open: isSidebarOpen }">
        <div class="sidebar-top">
            <transition name="fade">
                <button v-if="isSidebarOpen" class="create-btn" @click="createProject" aria-label="프로젝트 생성">
                    + 프로젝트 생성
                </button>
            </transition>
        </div>

        <div class="sidebar-list-section">
            <div class="section-container">
                <h3>내 프로젝트</h3>
                <div class="scroll-box">
                    <ul>
                        <li>프로젝트 연습</li>
                    </ul>


                </div>


            </div>

            <div class="section-container">
                <h3>참여 프로젝트</h3>
                <div class="scroll-box">
                    <ul>
                        <li>알고리즘 함께 연습</li>
                    </ul>
                </div>
            </div>
        </div>
    </aside>


</template>

<style scoped>
/* ★★★★★ 여기가 핵심: 전체 테마 및 버튼 위치 수정 ★★★★★ */
.sidebar {
    height: 100vh;
    width: 265px;
    flex-shrink: 0;
    background-color: #ffffff;
    /* 흰색 배경 */
    border-right: 1px solid #e5e5e5;
    /* 연한 회색 테두리 */
    padding: 15px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    overflow: hidden;

}

.sidebar-top {
    /* 버튼 전용 상단 영역 */
    border-bottom: 1px solid #eee;
    min-height: 40px;
    display: flex;
    align-items: center;
    justify-content: flex-start;

}

.sidebar-list-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding-top: 16px;
}

/* 햄버거 버튼 */
.hamburger-btn {
    position: fixed;
    top: 5px;
    left: 15px;
    /* 기본 위치 */
    z-index: 1001;
    background: none;
    border: none;
    color: #333;
    /* 어두운 아이콘 색상 */
    font-size: 24px;
    cursor: pointer;
    transition: left 0.3s ease-in-out;
    /* left 속성 애니메이션 */
}

/* 사이드바가 열렸을 때 햄버거 버튼의 위치 */
.hamburger-btn.open {
    left: 255px;
    /* 사이드바 너비(280px) + 여백(15px) */
}

/* 사이드바 스타일 */


/* 프로젝트 생성 버튼에 대한 css */
.create-btn {
    position: fixed;
    top: 5px;
    left: 10px;
    /* 사이드바 너비에 맞춰 위치 지정 */
    z-index: 1000;
    background-color: #2b73be;
    color: white;
    border: none;
    border-radius: 6px;
    padding: 8px 12px;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.2s ease;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.sidebar:not(.open) {
    margin-left: -280px;
}

.section-container {
    flex: 1;
    /* 두 영역을 균등하게 나눔 */
    display: flex;
    /* 내부를 세로 배치 */
    flex-direction: column;
    /* 제목 위, 리스트 아래로 정렬 */
    min-height: 0;
}

.scroll-box {
    flex: 1;
    /* 남은 공간을 모두 차지 */
    overflow-y: auto;
    /* 내부 항목이 넘치면 스크롤 표시 */
    padding-right: 5px;
    /* 우측 여백 (스크롤바 안 가리게) */
}



.sidebar-content h3 {
    color: #0056b3;
    /* 포인트 컬러 (파란색 계열) */
    border-bottom: 1px solid #e5e5e5;
    padding-bottom: 10px;
}

.sidebar-content p {
    color: #555;
}
</style>