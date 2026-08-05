<script setup>
import { ref, computed } from 'vue';
import userApi from '@/api/user/user_index';
import projectMemberApi from '@/api/project_member/project_member_index';

const props = defineProps({
    projectId: { type: [String, Number], required: true },
    members: { type: Array, required: true },
    myIdx: { type: [String, Number], required: true },
});

defineEmits(['close']);

const isAdmin = computed(() => {
    const me = props.members.find(m => String(m.userId) === String(props.myIdx));
    return me?.status === 'ADMIN';
});

const searchQuery = ref('');
const searchResults = ref([]);
let searchTimer = null;

const onSearchInput = () => {
    if (searchTimer) clearTimeout(searchTimer);
    const keyword = searchQuery.value.trim();
    if (!keyword) {
        searchResults.value = [];
        return;
    }
    searchTimer = setTimeout(async () => {
        const data = await userApi.findUserNickname(keyword);
        const results = (data && data.results) || [];
        const memberIds = new Set(props.members.map(m => String(m.userId)));
        searchResults.value = results.filter(u => !memberIds.has(String(u.idx)));
    }, 300);
};

const invite = async (user) => {
    const data = await projectMemberApi.inviteMember(props.projectId, user.idx);
    if (data && data.success) {
        props.members.push({ userId: user.idx, status: 'USER', username: user.nickname });
        searchQuery.value = '';
        searchResults.value = [];
    } else {
        alert('초대에 실패했습니다.');
    }
};

const remove = async (member) => {
    if (!window.confirm(`${member.username}님을 제거하시겠습니까?`)) return;
    const data = await projectMemberApi.removeMember(props.projectId, member.userId);
    if (data && data.success) {
        const idx = props.members.findIndex(m => m.userId === member.userId);
        if (idx !== -1) props.members.splice(idx, 1);
    } else {
        alert('제거에 실패했습니다.');
    }
};
</script>

<template>
    <div class="member-modal-overlay" @click.self="$emit('close')">
        <div class="member-modal">
            <div class="member-modal-header">
                <h3>프로젝트 멤버</h3>
                <button class="close-btn" @click="$emit('close')">×</button>
            </div>

            <div v-if="isAdmin" class="invite-area">
                <div class="invite-input-wrapper">
                    <input
                            type="text"
                            v-model="searchQuery"
                            @input="onSearchInput"
                            placeholder="닉네임으로 검색"
                    />
                </div>
                <div class="search-result-list" v-if="searchResults.length > 0">
                    <div
                            v-for="user in searchResults"
                            :key="user.idx"
                            class="search-result-item"
                            @click="invite(user)"
                    >
                        {{ user.nickname }}
                        <span class="invite-label">초대</span>
                    </div>
                </div>
            </div>

            <div class="member-list">
                <div v-for="member in members" :key="member.userId" class="member-item">
                    <div class="member-info">
                        <div class="member-avatar"></div>
                        <span class="member-name">
              {{ member.username }}
              <span v-if="String(member.userId) === String(myIdx)">(나)</span>
            </span>
                    </div>
                    <div class="member-right">
                        <span class="member-role">{{ member.status === 'ADMIN' ? '소유자' : '멤버' }}</span>
                        <button
                                v-if="isAdmin && String(member.userId) !== String(myIdx)"
                                class="remove-btn"
                                @click="remove(member)"
                        >
                            제거
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.member-modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100000;
}

.member-modal {
    width: 420px;
    max-height: 70vh;
    background: #2b2b2b;
    border-radius: 8px;
    padding: 20px;
    color: #eee;
    display: flex;
    flex-direction: column;
    gap: 16px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
}

.member-modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.member-modal-header h3 {
    margin: 0;
    font-size: 16px;
}

.close-btn {
    background: none;
    border: none;
    color: #ccc;
    font-size: 20px;
    cursor: pointer;
}

.close-btn:hover {
    color: #fff;
}

.invite-input-wrapper input {
    width: 100%;
    padding: 8px 10px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    color: #eee;
    border-radius: 4px;
    box-sizing: border-box;
}

.search-result-list {
    margin-top: 6px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 4px;
    max-height: 160px;
    overflow-y: auto;
}

.search-result-item {
    display: flex;
    justify-content: space-between;
    padding: 8px 10px;
    cursor: pointer;
}

.search-result-item:hover {
    background: rgba(255, 255, 255, 0.08);
}

.invite-label {
    color: #6aa9ff;
    font-size: 12px;
}

.member-list {
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.member-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 4px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.member-info {
    display: flex;
    align-items: center;
    gap: 10px;
}

.member-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #555;
    flex-shrink: 0;
}

.member-name {
    font-size: 14px;
}

.member-right {
    display: flex;
    align-items: center;
    gap: 10px;
}

.member-role {
    font-size: 13px;
    color: #999;
}

.remove-btn {
    background: none;
    border: 1px solid rgba(255, 100, 100, 0.4);
    color: #ff6b6b;
    padding: 4px 10px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
}

.remove-btn:hover {
    background: rgba(255, 100, 100, 0.15);
}
</style>