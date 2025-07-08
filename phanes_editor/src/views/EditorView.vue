<script setup>
import CodeEditor from '@/components/CodeEditor.vue';
import DosChat from '@/components/DosChat.vue';
import HeTree from '@/components/Tree.vue'
import '@he-tree/vue/style/default.css'
import Footer from '@/components/Footer.vue';
import { ref } from 'vue';

// 사이드바의 열림/닫힘 상태를 관리
const isSidebarOpen = ref(true);

const toggleSidebar = () => {
    isSidebarOpen.value = !isSidebarOpen.value;
};
</script>

<template>
<div class="container">
  <div class="sidebar-container">
    <!-- 햄버거 버튼 -->
    <button class="hamburger-btn" :class="{ open: isSidebarOpen }" @click="toggleSidebar" aria-label="사이드바 열기/닫기">
        ☰
    </button>

    <!-- 사이드바 -->
    <aside class="sidebar" :class="{ open: isSidebarOpen }">
        <div class="sidebar-content">
            <HeTree/>
        </div>
    </aside>
  </div>
    <!-- 메인 콘텐츠 영역 (에디터, 채팅, 푸터 포함) -->
    <div class="main-content-wrapper">
        <div class="main-content">
                <CodeEditor />
            <DosChat />
        </div>  
                <Footer />
    </div>
</div>
</template>

<style scoped>
.container{
    display: flex; /* 에디터와 채팅을 가로로 배치 */
    flex-direction: row;
    padding: 0px;
    margin: 0px;
}

/* 햄버거 버튼 스타일 */
.hamburger-btn {
  position: fixed;
  top: 15px;
  left: 15px;
  z-index: 1001;
  background: none;
  border: none;
  color: #333;
  font-size: 24px;
  cursor: pointer;
  transition: transform 0.3s ease-in-out;
  margin-top: 10px;
}

/* 사이드바가 열렸을 때 햄버거 버튼의 위치 */
.hamburger-btn.open {
  left: 195px; /* 사이드바 너비(280px) + 여백(15px) */
}

/* 사이드바 스타일 */
.sidebar {
  /* ★ 핵심: 너비(width)에 transition 적용 */
  width: 195px;
  flex-shrink: 0; /* 사이드바 너비가 줄어들지 않도록 고정 */
  background-color: #ffffff;
  border-right: 1px solid #e5e5e5;
  transition: width 0.3s ease-in-out, padding 0.3s ease-in-out;
  overflow: hidden; /* 너비가 0이 될 때 내용 숨김 */
  padding: 60px 20px 20px 20px; /* 상단 여백 (햄버거 버튼 공간) */
}

/* 사이드바가 닫혔을 때의 상태 */
.sidebar:not(.open) {
  width: 55px;
  padding-left: 0;
  padding-right: 0;
  visibility: hidden;
}

/* 메인 콘텐츠를 감싸는 래퍼 */


/* 실제 콘텐츠가 들어가는 main 영역 */
.main-content {
  flex-grow: 1; /* ★ 핵심: 남은 공간을 모두 차지 */
  display: flex; /* 에디터와 채팅을 가로로 배치 */
  flex-direction: row;
  margin: 0px;
}

</style>