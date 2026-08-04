<template>
  <div class="create-project-container">
    <div class="form-wrapper">
      <h1 class="title">새로운 프로젝트 생성</h1>
      <p class="subtitle">새로운 협업 공간을 만들고 동료를 초대하세요.</p>

      <div class="form-group floating-label" :class="{ 'is-valid': isNameValid }">
        <input type="text" id="project-name" v-model.trim="project.projectName" placeholder=" " ref="nameInputRef"
          @keydown.enter.prevent="handleEnterKey('name')" />
        <label for="project-name">프로젝트 이름</label>
        <button v-if="isNameValid" @click="proceedToNextStep('description')" class="icon-btn-next" aria-label="다음 단계로">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19,7v4H5.83l3.58-3.59L8,6l-6,6l6,6l1.41-1.41L5.83,13H21V7H19z"></path>
          </svg>
        </button>
      </div>

      <Transition name="slide-fade">
        <div v-if="steps.showDescription" class="form-group floating-label">
          <textarea id="project-description" v-model="project.description" rows="4" placeholder=" "
            ref="descriptionInputRef" @keydown.enter="handleEnterKey('description', $event)"></textarea>
          <label for="project-description">프로젝트 설명 (선택 사항)</label>
          <button @click="proceedToNextStep('language')" class="icon-btn-next" aria-label="다음 단계로">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19,7v4H5.83l3.58-3.59L8,6l-6,6l6,6l1.41-1.41L5.83,13H21V7H19z"></path>
            </svg>
          </button>
        </div>
      </Transition>

      <Transition name="slide-fade">
        <div v-if="steps.showLanguage" class="form-group floating-label">
          <select id="project-language" v-model="project.language" @change="proceedToNextStep('invite')"
            ref="languageSelectRef">
            <option disabled selected value="">언어를 선택하세요</option>
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="c">C</option>
            <option value="cpp">C++</option>
            <option value="markdown">Markdown</option>
          </select>
          <label for="project-language">주요 언어</label>
        </div>
      </Transition>

      <Transition name="slide-fade">
          <div v-if="steps.showInvite" class="form-group">
              <label for="project-invite">동료 초대하기 (선택 사항)</label>
              <div class="invite-input-wrapper">
                  <input
                          type="text"
                          id="project-invite"
                          v-model.trim="searchQuery"
                          @keydown.enter.prevent="searchUsers"
                          placeholder="닉네임으로 검색"
                          ref="inviteInputRef"
                  />
                  <button @click="searchUsers" class="add-btn">검색</button>
              </div>

              <div class="search-result-list" v-if="searchResults.length > 0">
                  <div
                          v-for="user in searchResults"
                          :key="user.idx"
                          class="search-result-item"
                          @click="addMember(user)"
                  >
                      {{ user.nickname }}
                  </div>
              </div>

              <div class="invitee-list" v-if="selectedMembers.length > 0">
    <span
            v-for="(member, i) in selectedMembers"
            :key="member.idx"
            class="invitee-tag"
    >
      {{ member.nickname }}
      <button @click="removeInvitee(i)" class="remove-tag-btn">×</button>
    </span>
              </div>
          </div>
      </Transition>

      <Transition name="slide-fade">
        <button v-if="steps.showSubmit" @click="createProject" :disabled="!isNameValid" class="submit-btn">
          프로젝트 생성하기
        </button>
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, nextTick } from 'vue';
import { useRouter } from 'vue-router'
import api from '@/api/project/project_index'
import userApi from '@/api/user/user_index'

const router = useRouter();
const nameInputRef = ref(null);
const descriptionInputRef = ref(null);
const languageSelectRef = ref(null);
const inviteInputRef = ref(null);

const searchQuery = ref('');
const searchResults = ref([]);
const selectedMembers = ref([]);

const steps = reactive({
  showDescription: false,
  showLanguage: false,
  showInvite: false,
  showSubmit: false,
});

const project = reactive({
  projectName: '',
  description: '',
  language: '',
  userId: '', // 값이 사용되고 있지 않음
  memberIdx: [],
});

const isNameValid = computed(() => project.projectName.trim().length >= 2);

async function proceedToNextStep(stepName) {
  if (stepName === 'description' && isNameValid.value && !steps.showDescription) {
    steps.showDescription = true;
    await nextTick();
    descriptionInputRef.value?.focus();
  } else if (stepName === 'language' && !steps.showLanguage) {
    steps.showLanguage = true;
    await nextTick();
    languageSelectRef.value?.focus();
  } else if (stepName === 'invite' && !steps.showInvite) {
    steps.showInvite = true;
    steps.showSubmit = true;
    await nextTick();
    inviteInputRef.value?.focus();
  }
}

// ★ 수정: Enter 키 로직을 하나의 함수로 통합하여 명확하게 제어
function handleEnterKey(currentStep, event = null) {
  // 설명창에서 Shift+Enter는 줄바꿈
  if (currentStep === 'description' && event?.shiftKey) {
    return;
  }

  // 설명창에서 그냥 Enter는 기본 동작(줄바꿈) 방지
  if (currentStep === 'description') {
    event?.preventDefault();
  }

  // 각 단계에 맞는 다음 액션 호출
  if (currentStep === 'name') {
    proceedToNextStep('description');
  } else if (currentStep === 'description') {
    proceedToNextStep('language');
  }
}

async function searchUsers() {
    const keyword = searchQuery.value.trim();
    if (!keyword) return;
    try {
        const data = await userApi.findUserNickname(keyword);
        searchResults.value = data.results || [];
    } catch (error) {
        console.log(error);
        searchResults.value = [];
    }
}

function addMember(user) {
    if (!project.memberIdx.includes(user.idx)) {
        project.memberIdx.push(user.idx);
        selectedMembers.value.push({ idx: user.idx, nickname: user.nickname });
    }
    searchResults.value = [];
    searchQuery.value = '';
}

function removeInvitee(index) {
    const removed = selectedMembers.value[index];
    project.memberIdx = project.memberIdx.filter(idx => idx !== removed.idx);
    selectedMembers.value.splice(index, 1);
}
async function createProject() {
  if (!isNameValid.value) {
    alert('프로젝트 이름을 2글자 이상 입력해주세요.');
    return;
  }
  console.log('생성될 프로젝트 정보:', JSON.stringify(project, null, 2));
  alert(`'${project.projectName}' 프로젝트 생성을 요청했습니다!`);

  const data = await api.projectCreate(JSON.stringify(project));

  if (data && data.success) {
    alert("응답 성공 ")
    console.log(data.results);
    router.push({ name: 'editor', params: { id: data.results.idx }});
  } else {
    alert("응답 실패")
  }
}
</script>

<style scoped>
/* 이전 CSS 코드는 대부분 그대로 사용합니다 */
/* ... .create-project-container 부터 이전과 동일 ... */

/* ★★★★★ 여기가 핵심 수정/추가 부분입니다 ★★★★★ */

/* 아이콘 버튼 스타일 */
.icon-btn-next {
  position: absolute;
  top: 50%;
  right: 8px;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  transition: color 0.2s;
  opacity: 0;
  /* 평소에는 숨김 */
  transition: opacity 0.2s ease-in-out;
}

/* 포커스 되거나 값이 있을 때 아이콘 표시 */
.form-group.floating-label input:focus+label+.icon-btn-next,
.form-group.floating-label input:not(:placeholder-shown)+label+.icon-btn-next,
.form-group.floating-label textarea:focus+label+.icon-btn-next,
.form-group.floating-label textarea:not(:placeholder-shown)+label+.icon-btn-next {
  opacity: 1;
}

.icon-btn-next:hover {
  color: #4f46e5;
}

/* 모든 input, textarea에 오른쪽 패딩 추가하여 아이콘 공간 확보 */
input[type="text"],
textarea {
  padding-right: 45px;
}

/* 유효성 만족 시 반짝이는 애니메이션 효과 */
@keyframes glowing-border {
  0% {
    box-shadow: 0 0 3px rgba(79, 70, 229, 0.2);
  }

  50% {
    box-shadow: 0 0 10px 3px rgba(79, 70, 229, 0.5);
  }

  100% {
    box-shadow: 0 0 3px rgba(79, 70, 229, 0.2);
  }
}

.form-group.is-valid input {
  border-color: #4f46e5;
  animation: glowing-border 1.5s infinite;
}

/* 아래는 이전 답변의 CSS를 그대로 가져온 것입니다. */
.create-project-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
  background-color: #f4f5f7;
  min-height: 100vh;
}

.form-wrapper {
  width: 100%;
  max-width: 600px;
  background-color: #ffffff;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.title {
  font-size: 2rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 10px;
}

.subtitle {
  font-size: 1rem;
  color: #6b7280;
  text-align: center;
  margin-bottom: 40px;
}

.form-group {
  margin-bottom: 24px;
}

.form-group.floating-label {
  position: relative;
  margin-top: 20px;
}

div.form-group.floating-label>label {
  position: absolute;
  top: 13px;
  left: 13px;
  color: #9ca3af;
  pointer-events: none;
  transform-origin: top left;
  transition: all 0.2s ease-out;
  background-color: transparent;
  padding: 0 5px;
}

div.form-group.floating-label>input:focus+label,
div.form-group.floating-label>input:not(:placeholder-shown)+label,
div.form-group.floating-label>textarea:focus+label,
div.form-group.floating-label>textarea:not(:placeholder-shown)+label,
div.form-group.floating-label>select:focus+label,
div.form-group.floating-label>select:valid+label {
  transform: translateY(-24px) scale(0.85);
  color: #4f46e5;
  background-color: white;
}

.form-group:not(.floating-label) label {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
}

input[type="text"],
textarea,
select {
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 1rem;
  box-sizing: border-box;
}

input[type="text"]:focus,
textarea:focus,
select:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2);
}

select {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpath d='M6 9l6 6 6-6'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 0.7rem center;
  background-size: 1em;
}

.invite-input-wrapper {
  display: flex;
}

.add-btn {
  flex-shrink: 0;
  margin-left: 10px;
  padding: 0 15px;
  background-color: #e5e7eb;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.add-btn:hover {
  background-color: #d1d5db;
}

.invitee-list {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.invitee-tag {
  display: inline-flex;
  align-items: center;
  background-color: #e0e7ff;
  color: #4f46e5;
  padding: 5px 10px;
  border-radius: 12px;
  font-size: 0.9rem;
}

.remove-tag-btn {
  margin-left: 8px;
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #4f46e5;
  padding: 0;
  line-height: 1;
}

.submit-btn {
  width: 100%;
  padding: 15px;
  background-color: #4f46e5;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: 10px;
}

.submit-btn:disabled {
  background-color: #a5b4fc;
  cursor: not-allowed;
}

.submit-btn:hover:not(:disabled) {
  background-color: #4338ca;
}

.slide-fade-enter-active {
  transition: all 0.4s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}

.search-result-list {
    margin-top: 8px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    overflow: hidden;
}

.search-result-item {
    padding: 10px 12px;
    cursor: pointer;
    transition: background-color 0.15s;
}

.search-result-item:hover {
    background-color: #e0e7ff;
}

.search-result-item + .search-result-item {
    border-top: 1px solid #e5e7eb;
}
</style>