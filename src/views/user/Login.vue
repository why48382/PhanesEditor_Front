<script setup>
import { reactive } from 'vue';
import userApi from '@/api/user/user_index'
import { useRouter } from 'vue-router'
import useUserStore from '@/stores/useUserStore'

const userStore = useUserStore();

const router = useRouter()

const loginForm = reactive({
  email: '',
  password: ''
})

const kakaoLogin = (provider) => {
  if (provider === 'kakao') {
    window.location.href = 'https://api.gomorebi.kro.kr/oauth2/authorization/kakao';
  }

  router.push('/');
};

const handleEmailSignIn = async () => {

  const data = await userApi.userSignIn(loginForm);

  if (data) {
    userStore.login(data)

    router.push('/');
  }
}
</script>
<template>
  <div class="signup-container">
    <div class="form-wrapper">

      <div>
        <h1 class="title">로그인</h1>
        <p class="subtitle">사용하시는 소셜 계정으로<br>간편하게 시작해보세요.</p>

        <div class="social-login-buttons">
          <form class="social-login-buttons">
            <div class="text-input-wrapper">
              <input v-model="loginForm.email" class="text-input" name="email" type="email"
                placeholder="이메일을 입력해주세요." />
            </div>
            <div class="text-input-wrapper">
              <input v-model="loginForm.password" class="text-input" name="password" type="password"
                placeholder="비밀번호를 입력해주세요." />
            </div>
          </form>
          <button class="social-btn google" @click="handleEmailSignIn()">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path fill-rule="evenodd" clip-rule="evenodd"
                d="M3.75 5.25L3 6V18L3.75 18.75H20.25L21 18V6L20.25 5.25H3.75ZM4.5 7.6955V17.25H19.5V7.69525L11.9999 14.5136L4.5 7.6955ZM18.3099 6.75H5.68986L11.9999 12.4864L18.3099 6.75Z"
                fill="#080341" />
            </svg>
            <span>이메일로 로그인</span>
          </button>
          <button class="social-btn google" @click="router.push('/user/signup')">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path fill-rule="evenodd" clip-rule="evenodd"
                d="M3.75 5.25L3 6V18L3.75 18.75H20.25L21 18V6L20.25 5.25H3.75ZM4.5 7.6955V17.25H19.5V7.69525L11.9999 14.5136L4.5 7.6955ZM18.3099 6.75H5.68986L11.9999 12.4864L18.3099 6.75Z"
                fill="#080341" />
            </svg>
            <span>이메일로 회원가입</span>
          </button>

          <button class="social-btn kakao" @click="kakaoLogin('kakao')">
            <svg class="icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c1.82 0 3.53-.49 5-1.35 0 0 0 0 0 0-1.28-.6-2.28-1.83-2.5-3.32-.02-.15-.03-.3-.03-.45 0-2.42 1.95-4.38 4.38-4.38.35 0 .69.04 1.02.12C20.49 11.47 21 9.82 21 8c0-3.31-2.69-6-6-6-3.31 0-6 2.69-6 6 0 .82.16 1.59.45 2.28-.27 1.49-1.27 2.72-2.55 3.32C6.53 21.51 9.82 22 12 22c5.52 0 10-4.48 10-10 0-.82-.16-1.59-.45-2.28.27-1.49 1.27-2.72 2.55-3.32C21.47 6.49 18.18 6 16 6c-3.31 0-6 2.69-6 6z"
                fill="#3C1E1E" />
            </svg>
            <span>카카오로 로그인</span>
          </button>
        </div>
      </div>
    </div>
  </div>

</template>


<style scoped>
.signup-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
  background-color: #f4f5f7;
  min-height: 100vh;
}

.form-wrapper {
  width: 100%;
  max-width: 480px;
  background-color: #ffffff;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
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
  line-height: 1.6;
}

.subtitle .highlight {
  color: #4f46e5;
  font-weight: bold;
}

/* --- 소셜 로그인 버튼 스타일 --- */
.social-login-buttons {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.social-btn {
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.social-btn .icon {
  margin-right: 12px;
}

.social-btn.google {
  background-color: #ffffff;
  color: #374151;
}

.social-btn.google:hover {
  background-color: #f9fafb;
}

.social-btn.kakao {
  background-color: #FEE500;
  color: #3C1E1E;
  border-color: #FEE500;
}

.social-btn.kakao:hover {
  background-color: #fddc00;
}

/* --- 플로팅 라벨 및 입력창 스타일 --- */
.form-group {
  text-align: left;
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
div.form-group.floating-label>input:not(:placeholder-shown)+label {
  transform: translateY(-24px) scale(0.85);
  color: #4f46e5;
  background-color: white;
}

input[type="text"] {
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 1rem;
  box-sizing: border-box;
}

input[type="text"]:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2);
}

@keyframes glowing-border {
  0% {
    box-shadow: 0 0 3px rgba(79, 70, 229, 0.3);
  }

  50% {
    box-shadow: 0 0 8px 3px rgba(79, 70, 229, 0.5);
  }

  100% {
    box-shadow: 0 0 3px rgba(79, 70, 229, 0.3);
  }
}

.form-group.is-valid input {
  border-color: #4f46e5;
  animation: glowing-border 1.5s infinite;
}

/* 가입 완료 버튼 */
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

.text-input-wrapper {
  display: flex;
}


.text-input {
  width: 100%;
  display: block;
  text-align: left;
  border: 0.0625rem solid rgb(206, 212, 218);
  background-color: rgb(255, 255, 255);
  transition: border-color 100ms;
  min-height: 2.625rem;
  padding-left: calc(0.875rem);
  padding-right: calc(0.875rem);
  border-radius: 0.5rem;
}
</style>