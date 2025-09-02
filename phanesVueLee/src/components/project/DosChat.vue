  <script setup lang="ts">
  import { ref, onMounted, nextTick } from 'vue';
  import Stomp from 'stompjs';
  import api from '@/api/chat/chat_index'

  let projectId = window.location.pathname.split('/')[3];

  const socket = ref(null);

  const messageList = ref([]);

  const subscribe = () => { // 프로젝트 id 등록시키기
    socket.value.subscribe(`/topic/chat/${projectId}`, msg => {
      const recevidData = msg.body;
      messageList.value.push(JSON.parse(recevidData));
      console.log(messageList.value[0]); // <-- 전달 받은 데이터
      console.log(messageList.value.length);
    });
  }
  const connectWebSocket = () => {
    const ws = new WebSocket("ws://localhost:8080/websocket")
    const client = Stomp.over(ws);
    socket.value = client;

    client.connect({},
      frame => {
        subscribe();
      },
      err => { });
  }

  const props = defineProps(['chatList'])

  // --- 상태 관리 ---

  // 현재 사용자의 닉네임 (나중에 로그인 정보로 대체)
  const currentUser = ref('jamjari1');


  // 채팅 메시지 목록 (N:N 채팅을 보여주기 위한 샘플 데이터 포함)
  const messages = ref([
    { id: 1, username: 'system', message: 'Welcome to Phanes Editor Chat.', time: '09:28:01' },
    { id: 2, username: 'guest123', message: '안녕하세요! 이 부분 어떻게 해결해야 할까요?', time: '09:28:15' },
    { id: 3, username: 'jamjari1', message: '아, 그 문제는 제가 한번 볼게요.', time: '09:28:22' },
    { id: 4, username: 'master_dev', message: '잠시만요, 제가 수정해봤습니다.', time: '09:28:40' },
    { id: 5, username: 'master_dev', message: '...', time: '09:28:40' }
  ]);

  // 새 메시지 입력을 위한 ref
  const newMessage = ref('');

  // DOM 요소 참조를 위한 ref
  const messageWindowRef = ref<HTMLElement | null>(null);
  const inputRef = ref<HTMLInputElement | null>(null);

  // --- 사용자 색상 배정 ---

  const userColors = ['#00FF00', '#FFFF00', '#00FFFF', '#FF00FF', '#FFA500', '#00BFFF'];
  const userColorMap = new Map<string, string>();

  function getUserColor(username: string): string {
    if (username === 'system') return '#FF5555'; // 시스템 메시지는 빨간색
    if (!userColorMap.has(username)) {
      const hash = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const color = userColors[hash % userColors.length];
      userColorMap.set(username, color);
    }
    return userColorMap.get(username)!;
  }

  // --- 메시지 전송 및 UI 처리 ---

  // 메시지 전송 함수
  async function sendMessage() {

    if (newMessage.value.trim() === '') return;

    const now = new Date();
    const newMsg = {
      id: messages.value.length + 1,
      username: currentUser.value,
      message: newMessage.value,
      time: now.toTimeString().split(' ')[0],
    };

    const chats = {
      projectId: projectId,
      message: newMessage.value // 이거만 잘 설정하면 됨
    }

    // messages.value.push(newMsg);
    newMessage.value = ''; // 입력창 비우기


    console.log(chats.message + "채팅 메시지 테스트");
    const data = await api.chatCreate(chats);

    if (data) {
      // 데이터 잘 받아옴 굳
    }

    console.log(newMessage.value + "작성한 메시지");
    socket.value.send(`/app/chat/${projectId}`, {}, JSON.stringify(newMsg)); // 여기도 id 수정해야 함

    // 새 메시지가 추가된 후, 스크롤을 맨 아래로 이동
    nextTick(() => {
      const messageWindow = messageWindowRef.value;
      if (messageWindow) {
        messageWindow.scrollTop = messageWindow.scrollHeight;
      }
    });
  }

  // 입력창 포커스를 위한 함수
  function focusInput() {
    inputRef.value?.focus();
  }

  // 컴포넌트 마운트 시 입력창에 자동 포커스
  onMounted(() => {
    focusInput();
    connectWebSocket();
  });
</script>

<template>
  <div class="chat-container" @click="focusInput">
    <div class="message-window" ref="messageWindowRef">
      <div class="header">
        === Phanes Editor Command-Line Chat ===
      </div>
      <ul>
        <li v-for="msg in chatList" :key="msg.id" class="message-line">
          <span class="timestamp">[{{ msg.sentAt }}]</span>
          <span class="message-user" :style="{ color: getUserColor(msg.username) }">&lt;{{ msg.username }}&gt;</span>
          <span class="message-text">{{ msg.message }}</span>
        </li>
        <li v-for="msg in messageList" :key="msg.id" class="message-line">
          <span class="timestamp">[{{ msg.time }}]</span>
          <span class="message-user" :style="{ color: getUserColor(msg.username) }">&lt;{{ msg.username }}&gt;</span>
          <span class="message-text">{{ msg.message }}</span>
        </li>
      </ul>
    </div>
    <div class="input-area">
      <span class="prompt">&gt;</span>
      <input type="text" v-model="newMessage" @keydown.enter="sendMessage" class="chat-input" ref="inputRef"
        autocomplete="off" />
    </div>
  </div>
</template>

<style scoped>
/* DOS 화면 느낌을 위한 스타일링 */
.chat-container {
  background-color: #1e1e1e;
  color: #66dd66;
  /* 밝은 녹색 */
  font-family: 'Courier New', Courier, monospace;
  height: 100%;
  border: 2px solid #555;
  padding: 10px;
  max-height: 95%;
  min-width: 20rem;
  position: relative;
  display: flex;
  flex-direction: column;
  overflow-y: scroll;
  margin-left: 10px;
}

.message-window {
  flex-grow: 1;
  overflow-y: auto;
  margin-bottom: 10px;
}

.header {
  color: #FFFF00;
  /* 노란색 */
  text-align: center;
  margin-bottom: 10px;
  padding: 10px;
  border-bottom: 1px dashed #555;
}

.message-window ul {
  list-style-type: none;
  padding: 5px;
  margin: 0;
}

.message-line {
  margin-bottom: 5px;
  word-wrap: break-word;
  /* 긴 단어 줄바꿈 */
}

.timestamp {
  color: #888;
  margin-right: 10px;
}

.message-user {
  font-weight: bold;
}

.message-text {
  margin-left: 5px;
  white-space: pre-wrap;
  /* 텍스트 내 공백과 줄바꿈 유지 */
}

.input-area {
  display: flex;
  align-items: center;
  border-top: 1px dashed #555;
  padding-top: 5px;
}

.prompt {
  margin-right: 5px;
  /* animation: blink 1s step-end infinite; */
}

.chat-input {
  background-color: transparent;
  border: none;
  color: #00FF00;
  font-family: inherit;
  font-size: 1em;
  width: 100%;
  outline: none;
  /* 포커스 시 테두리 제거 */
}

/* 깜빡이는 커서 효과 */
@keyframes blink {
  50% {
    opacity: 0;
  }
}
</style>