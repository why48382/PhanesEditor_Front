<script setup>
import SideBar from "@/components/SideBar.vue";
import Editor from "@/components/project/Editor.vue";
import EdirotFrame from "@/components/project/EdirotFrame.vue";
import DosChat from "@/components/project/DosChat.vue";
import TerminalWindows from "@/components/project/TerminalWindows.vue";
</script>

<template>
  <nav class="navbar">
    <EdirotFrame />
  </nav>

  <div class="layout">
    <SideBar />
    <div class="main">
      <div class="editor_chat">
        <Editor />
        <DosChat />
      </div>
      <div class="terminal">
        <TerminalWindows />
      </div>
    </div>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  height: calc(100vh - 48px);
  /* 네비게이션 바 높이 제외 */
  width: 100%;
}

.main {
  width: 100%;
  height: 100%;
}

.editor_chat {
  display: flex;
  height: 80%;
  margin: 10px;
}
</style>
