<script setup>
import SearchDetailButton from '@/components/SearchDetailButton.vue'
import sidebar from "@/components/SideBar.vue";
import { computed } from "vue";
import { useProjectStore } from "@/stores/useProjectStore";
import projectApi from "@/api/project/project_index";
import useUserStore from '@/stores/useUserStore'

const projectStore = useProjectStore();

const userStore = useUserStore();
// 서버 호출
const projectSearch = async () => {
    const data = await projectApi.projectSearch({
        name: projectStore.condition.name,   // 검색어
        email: projectStore.condition.email,
        language: projectStore.condition.language,
        page: projectStore.condition.page,
        size: projectStore.condition.size
    });

    if (data && data.success) {
        projectStore.setResults(data.results.content, data.totalElements);
    } else {
        projectStore.setResults([], 0);
    }
};

// 화면은 항상 store만 바라봄
const filteredProjects = computed(() => projectStore.searchResults);

</script>

<template>
  <div class="page-container">
      <sidebar v-if="userStore.loginCheck()"></sidebar>

    <main class="main-content">
      <!-- 검색창 -->
      <div class="search-section">
        <label for="search-box" class="prompt">&gt; </label>
        <input type="text" id="search-box" class="search-input" v-model="projectStore.condition.name"
          placeholder="검색어로 다시 필터링..." @keyup.enter="projectSearch" />

        <SearchDetailButton @search="projectSearch" />
      </div>

      <!-- 검색 결과 -->
      <div class="results-section">
        <template v-if="filteredProjects.length > 0">
          <ul class="project-list">
            <li v-for="project in filteredProjects" :key="project.idx" class="project-item">
              <!-- 프로젝트 제목 -->
              <div class="project-header">
                <router-link :to="{ name: 'editor', params: { id: project.idx } }">
                <h3 class="project-name">{{ project.name }}</h3>
                </router-link>
                <div class="project-meta">
                  <span class="badge">언어: {{ project.language }}</span>
                  <span class="badge">만든사람: {{ project.creator }}</span>
                  <span class="badge like">👍 {{ project.likeCount }}</span>
                </div>
              </div>

              <!-- 설명 -->
              <p class="project-desc">{{ project.description }}</p>
            </li>
          </ul>
        </template>

        <!-- 결과 없음 -->
        <p v-else class="no-results">
          '{{ projectStore.condition.name }}'에 대한 검색 결과가 없습니다.
        </p>
      </div>

    </main>
  </div>
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
  left: 295px;
  /* 사이드바 너비(280px) + 여백(15px) */
}

/* 사이드바 스타일 */
.sidebar {
  width: 280px;
  flex-shrink: 0;
  background-color: #ffffff;
  /* 흰색 배경 */
  border-right: 1px solid #e5e5e5;
  /* 연한 회색 테두리 */
  padding: 20px;
  padding-top: 60px;
  transition: margin-left 0.3s ease-in-out;
  margin-left: 0;
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

/* 메인 콘텐츠 영역 */
.main-content {
  margin-left: 35px;
  flex-grow: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.search-section {
  display: flex;
  align-items: center;
  border: 1px solid #ddd;
  background-color: #fff;
  padding: 10px;
  margin-bottom: 20px;
  flex-shrink: 0;
  border-radius: 8px;
}

.prompt {
  font-size: 1.2rem;
  color: #0056b3;
  margin-right: 10px;
}

.search-input {
  width: 100%;
  background: none;
  border: none;
  color: #333;
  font-family: inherit;
  font-size: 1.2rem;
}

.search-input:focus {
  outline: none;
}

/* 검색 결과 영역 */
.results-section {
  flex-grow: 1;
  overflow-y: auto;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
}

.results-section {
  flex-grow: 1;
  overflow-y: auto;
  background: #fafafa;
  border-radius: 10px;
  padding: 24px;
  font-family: 'Inter', sans-serif;
}

/* 리스트 */
.project-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.project-item {
  padding: 18px 0;
  border-bottom: 1px solid #e5e7eb;
  transition: background 0.2s ease;
}

.project-item:hover {
  background: #fdfdfd;
}

/* 제목 */
.project-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 6px;
}

.project-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

/* 메타 */
.project-meta {
  display: flex;
  gap: 10px;
  font-size: 0.8rem;
}

.badge {
  padding: 3px 10px;
  border-radius: 6px;
  background: #f3f4f6;
  color: #374151;
  font-weight: 500;
}

.badge.like {
  background: #fff0f6;
  color: #d6336c;
  font-weight: 600;
}

/* 설명 */
.project-desc {
  font-size: 0.9rem;
  color: #4b5563;
  margin-top: 4px;
  line-height: 1.5;
}

/* 결과 없음 */
.no-results {
  margin-top: 20px;
  text-align: center;
  color: #9ca3af;
  font-size: 0.95rem;
}
</style>