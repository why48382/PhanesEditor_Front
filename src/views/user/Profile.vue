<script setup>
import TopBar from '@/components/profile/TopBar.vue';
import { ref, computed, onMounted } from 'vue';
import userApi from '@/api/user/user_index'
import defaultProfileImg from '@/assets/images/gem_sample_1.svg';

const userObj = ref({});
const isEditing = ref(false);
const editNickname = ref('');

onMounted(async () => {
    try {
        const data = await userApi.userMyPage();
        const results = data.results;
        userObj.value = {
            nickname: results.nickName,
            createdAt: results.createdAt,
            email: results.email,
            platform: results.plafForm,
            imgUrl: results.imgUrl
        };
    }
    catch (error) {
        console.log(error);
    }
})

const createdAtText = computed(() => {
    if (!userObj.value.createdAt) return '';
    return new Date(userObj.value.createdAt).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
});

const startEdit = () => {
    editNickname.value = userObj.value.nickname;
    isEditing.value = true;
};

const cancelEdit = () => {
    isEditing.value = false;
};

const selectedFile = ref(null);

const onFileChange = (e) => {
    selectedFile.value = e.target.files[0] || null;
};

const saveEdit = async () => {
    const formData = new FormData();

    if (editNickname.value && editNickname.value !== userObj.value.nickname) {
        formData.append('nickname', editNickname.value);
    }
    if (selectedFile.value) {
        formData.append('profileImage', selectedFile.value);
    }

    if (!formData.has('nickname') && !formData.has('profileImage')) {
        isEditing.value = false;
        return;
    }

    try {
        const data = await userApi.upDateUser(editNickname.value, selectedFile.value);
        const result = data.results;
        if (result.nickname) userObj.value.nickname = result.nickname;
        if (result.profileImg) userObj.value.imgUrl = result.profileImg;
        selectedFile.value = null;
        isEditing.value = false;
    } catch (error) {
        console.log(error);
    }
};
</script>

<template>
    <TopBar />
    <div class="profile-area">
        <h2>개인정보</h2>
        <p>다양한 Phanes 서비스에서 사용되는 나의 내 환경설정에 관한 정보입니다.</p>

        <h3 class="section-title">Phanes 서비스에 표시되는 내 프로필정보</h3>
        <p>개인 정보 및 이력 관리를 위한 옵션입니다. 다른 사용자가 나에게 쉽게 연락할 수 있도록 허용하면 연락처 세부정보는 다른 사용자에게 공개될 수 있습니다. 프로필 정보는 일부만 확인할 수도 있습니다.</p>

        <form @submit.prevent="saveEdit">
            <div class="info-box">
                <div class="info-item">
                    <div class="info-label">프로필 사진</div>
                    <div class="info-detail">
                        <div class="info-value">프로필을 설정하여 개성을 뽐내세요.</div>
                        <img :src="userObj.imgUrl || defaultProfileImg" class="profile-img" alt="프로필 이미지">
                    </div>
                    <div v-if="isEditing" class="arrow">
                        <input type="file" accept="image/*" @change="onFileChange">
                    </div>
                </div>

                <div class="info-item">
                    <div class="info-label">닉네임</div>
                    <div class="info-detail">
                        <input v-if="isEditing" class="text-input" name="nickname" type="text"
                               v-model="editNickname" placeholder="닉네임을 입력해주세요" />
                        <div v-else class="info-value">{{ userObj.nickname }}</div>
                    </div>
                </div>

                <div class="info-item">
                    <div class="info-label">가입날짜</div>
                    <div class="info-detail">
                        <div class="info-value">{{ createdAtText }}</div>
                    </div>
                </div>
            </div>

            <h3 class="section-title">연락처정보</h3>

            <div class="info-box">
                <div class="info-item" v-if="userObj.platform?.toUpperCase() !== 'KAKAO'">
                    <div class="info-label">이메일</div>
                    <div class="info-detail">
                        <div class="info-value">{{ userObj.email }}</div>
                    </div>
                </div>

                <div class="info-item">
                    <div class="info-label">가입 플랫폼</div>
                    <div class="info-detail">
                        <div class="info-value">{{ userObj.platform }}</div>
                    </div>
                </div>
            </div>

            <h3 class="section-title">유저권한</h3>

            <div class="info-box">
                <div class="info-item">
                    <div class="info-label">등급</div>
                    <div class="info-detail">
                        <div class="info-value gray-text">일반</div>
                    </div>
                </div>
            </div>

            <div v-if="!isEditing" class="update-btn" @click="startEdit">
                수정하기
            </div>
            <template v-else>
                <div class="update-btn" @click="cancelEdit">
                    취소하기
                </div>
                <div class="update-btn save-btn">
                    <button type="submit" class="save-btn">저장</button>
                </div>
            </template>
        </form>
    </div>
</template>

<style scoped>
body {
    font-family: 'Google Sans', Arial, sans-serif;
    background-color: #fafafa;
    margin: 0;
    padding: 0;
    color: #202124;
}

/* top */
.top-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 20px;
}

.top-bar h1 {
    font-size: 22px;
    font-weight: normal;
}

/* .profile-icon {
            
        } */

.profile-img {
    width: 25px
}

.profile-area {
    padding: 40px 24px;
    max-width: 900px;
    margin: 0 auto;
}

.profile-area h2 {
    font-size: 24px;
    margin-bottom: 8px;
}

.profile-area p {
    font-size: 14px;
    color: #5f6368;
    margin-bottom: 32px;
}

.section-title {
    font-size: 20px;
    margin-bottom: 16px;
}

.info-box {
    background-color: #fff;
    border: 1px solid #dadce0;
    border-radius: 8px;
    padding: 24px;
    margin-bottom: 24px;
}

.info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 0;
    border-bottom: 1px solid #e0e0e0;
}

.info-item:last-child {
    border-bottom: none;
}

.info-label {
    font-size: 14px;
    color: #5f6368;
    min-width: 120px;
    /* 라벨 고정 */
    flex-shrink: 0;
}

.info-detail {
    flex: 1;
    display: flex;
    flex-direction: column;
    margin-left: 40px;
    /* Google 원본 간격 기준 */
}

.info-value {
    font-size: 16px;
    margin-bottom: 4px;
}

.arrow {
    font-size: 18px;
    color: #5f6368;
    cursor: pointer;
    margin-left: 16px;
}

.email-box {
    background-color: #f8f9fa;
    padding: 8px 12px;
    font-size: 14px;
    color: #1a73e8;
    border-radius: 4px;
    cursor: pointer;
    display: inline-block;
    margin-top: 8px;
}

.gray-text {
    font-size: 14px;
    color: #5f6368;
}

.update-btn {
    display: inline;
    padding: 5px 5px;
    border: 1px solid black;
    border-radius: 10px;
    background-color: #2b3a8f;
    color: white;
    margin-right: 10px;
}

.update-btn>a {
    text-decoration: none;
    color: white;
}

.save-btn {
    background-color: #2b3a8f;
    color: white;
    border: 0;
    font-size: 16px;
}
</style>