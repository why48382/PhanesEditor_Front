<script setup>
import { ref, computed } from 'vue';

const isSidebarOpen = ref(false);

const toggleSidebar = () => {
    isSidebarOpen.value = !isSidebarOpen.value;
};
</script>

<template>
    <div>
        <transition name="fade">
        <button v-if="isSidebarOpen" class="create-btn" @click="createProject" aria-label="프로젝트 생성">
            + 프로젝트 생성
        </button>
        </transition>

        <button class="hamburger-btn" :class="{ open: isSidebarOpen }" @click="toggleSidebar" aria-label="사이드바 열기/닫기">
            ☰
        </button>

    </div>

    <aside class="sidebar" :class="{ open: isSidebarOpen }">
        <div class="sidebar-content">
            <h3>My Projects</h3>
            <p><em>(파일 탐색기 영역)</em></p>
            <p>- Phanes-Editor-Project/</p>
            <p>- Algorithm-Study/</p>
            <p>- My-Portfolio/</p>
        </div>
    </aside>

</template>

<style scoped>
/* ★★★★★ 여기가 핵심: 전체 테마 및 버튼 위치 수정 ★★★★★ */
.page-container {
    display: flex;
    flex-direction: row;
    height: 100vh;
    width: 100vw;
    background-color: #f8f5f2;
    /* 부드러운 베이지/오프화이트 배경 */
    color: #333333;
    /* 기본 글자색을 어둡게 */
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    /* 가독성 좋은 기본 폰트 */
    overflow: hidden;
}

/* 햄버거 버튼 */
.hamburger-btn {
    position: fixed;
    top: 15px;
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
    left: 265px;
    /* 사이드바 너비(280px) + 여백(15px) */
}

/* 사이드바 스타일 */
.sidebar {
    height: 100vh;
    width: 260px;
    flex-shrink: 0;
    background-color: #ffffff;
    /* 흰색 배경 */
    border-right: 1px solid #e5e5e5;
    /* 연한 회색 테두리 */
    padding: 20px;
    padding-top: 0px;
    transition: margin-left 0.3s ease-in-out;
    margin-left: 0;
    overflow-y: scroll;
}
/* 프로젝트 생성 버튼에 대한 css */
.create-btn {
  position: fixed;
  top: 15px;
  left: 10px; /* 사이드바 너비에 맞춰 위치 지정 */
  z-index: 1000;
  background-color: #0056b3;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.sidebar:not(.open) {
    margin-left: -280px;
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