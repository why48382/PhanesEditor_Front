<script setup>
import { ref, onMounted, reactive } from 'vue';
import projectApi from '@/api/project/project_index'

const projectList = ref([])


const isSidebarOpen = ref(false);

const toggleSidebar = () => {
    isSidebarOpen.value = !isSidebarOpen.value;
};


const fetchAllProjects = async () => {
    const data = await projectApi.fetchAllProjects();

    if (data && data.success) {
        //코스 목록 추가
        if (data.results) {
            //조회 결과
            const list = data.results;

            if (list.length) {
                projectList.value.push(...list)
            }
        }
    } else {
        //코스 목록 초기화
        projectList.splice(0)
    }

}

// 컴포넌트가 화면에 마운트된 후 실행
onMounted(() => {
    fetchAllProjects()
});

</script>

<template>
    <div>
        <button class="hamburger-btn" :class="{ open: isSidebarOpen }" @click="toggleSidebar" aria-label="사이드바 열기/닫기">
            ☰
        </button>

        <aside class="sidebar" :class="{ open: isSidebarOpen }">
            <div class="sidebar-top">
                <transition name="fade">
                    <router-link :to="{ name: 'projectCreate' }">
                        <button v-if="isSidebarOpen" class="create-btn" aria-label="프로젝트 생성">
                            + 프로젝트 생성
                        </button>
                    </router-link>
                </transition>
            </div>

            <div class="sidebar-list-section">
                <div class="section-container">
                    <h3>내 프로젝트</h3>
                    <div class="scroll-box">
                        <ul>
                            <li v-for="project in projectList.filter(p => p.isOwner)" :key="project.projectId">
                                <router-link :to="{ name: 'editor', params: { id: project.projectId } }">
                                    {{ project.projectName }}
                                </router-link>
                            </li>
                        </ul>
                    </div>

                    <div class="section-container">
                        <h3>참여 프로젝트</h3>
                        <div class="scroll-box">
                            <ul>
                                <li v-for="project in projectList" :key="project.idx">
                                    <router-link :to="{ name: 'editor', params: { id: project.idx } }">
                                        {{ project.projectName }}
                                    </router-link>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    </div>


</template>

<style scoped>
/* ★★★★★ 여기가 핵심: 전체 테마 및 버튼 위치 수정 ★★★★★ */
.sidebar {
  width: 280px;
  flex-shrink: 0;
  background-color: #ffffff;
  border-right: 1px solid #e5e5e5;
  padding: 20px;
  padding-top: 60px;
  transition: margin-left 0.3s ease-in-out;
  margin-left: 0;

  height: 100vh;           /* 화면 높이 꽉 채우기 */
  overflow-y: auto;        /* 넘치면 스크롤 */
  box-sizing: border-box;  /* padding 포함해서 높이 계산 */

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

.list {
    margin-bottom: 10px;
    cursor: pointer;

}

.list:hover {
    text-decoration: underline;
    /* 마우스를 올렸을 때 밑줄 표시 */
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
    /* 밑바닥 여백 */

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
    padding-bottom: 5px;
}

.sidebar-content p {
    color: #555;
}
</style>