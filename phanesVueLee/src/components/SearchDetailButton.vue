<script setup>
import { ref } from 'vue'
import { useProjectStore } from '@/stores/useProjectStore'

const projectStore = useProjectStore()
const showModal = ref(false)

const emit = defineEmits(['search'])

const triggerSearch = () => {
  emit('search')
}

const applySearch = () => {
  triggerSearch()
  showModal.value = false
}
</script>

<template>
  <div class="detail-search">
    <!-- 상세검색 버튼 -->
    <button class="detail-btn" @click="showModal = true">상세검색</button>

    <!-- 모달 -->
    <Teleport to="body">
      <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
        <div class="modal-content">
          <h2>상세 검색</h2>

          <div class="modal-field">
            <label>프로젝트 이름</label>
            <input v-model="projectStore.condition.name" placeholder="프로젝트 이름 입력" />
          </div>

          <div class="modal-field">
            <label>언어</label>
            <select v-model="projectStore.condition.language">
              <option value="">전체</option>
              <option value="java">Java</option>
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="c">C</option>
              <option value="cpp">C++</option>
            </select>
          </div>

          <div class="modal-field">
            <label>참여자 이메일</label>
            <input v-model="projectStore.condition.email" placeholder="참여자 이메일 입력" />
          </div>

          <div class="modal-actions">
            <button @click="applySearch">검색하기</button>
            <button @click="showModal = false">닫기</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.detail-btn {
  padding: 6px 12px;
  background: #4f46e5;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  white-space: nowrap;
}
.detail-btn:hover {
  background: #4338ca;
}

.modal-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100vw; height: 100vh;
  background: rgba(0,0,0,0.25);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}
.modal-content {
  background: white;
  padding: 20px;
  border-radius: 12px;
  width: 400px;
  max-width: 90%;
  box-shadow: 0 5px 20px rgba(0,0,0,0.2);
}
.modal-content h2 {
  margin-bottom: 16px;
  font-size: 1.2rem;
  text-align: center;
}
.modal-field {
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
}
.modal-field label {
  font-size: 0.9rem;
  margin-bottom: 4px;
  color: #555;
}
.modal-field input,
.modal-field select {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.9rem;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 15px;
}
.modal-actions button:first-child {
  background: #4f46e5;
  color: white;
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
}
.modal-actions button:last-child {
  background: #e5e7eb;
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
}
</style>
