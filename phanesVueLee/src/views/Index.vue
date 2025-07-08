<script setup>

</script>


<template>
    <nav class="navbar">
        <a href="#">Phanes</a>
        <a href="#">이미지</a>
        <button class="login-btn">로그인</button>
    </nav>

    <div class="main-container">
        <div class="main-title">Phanes</div>
        <input type="text" class="url-input" placeholder="URL을 입력하세요">
    </div>

</template>


<style scoped>
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    background-color: #ffffff;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
}

.navbar {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding: 16px 32px;
    gap: 24px;
    font-size: 14px;
    font-weight: 500;
}

.navbar a {
    text-decoration: none;
    color: #1f2937;
    transition: color 0.2s;
}

.navbar a:hover {
    color: #3B82F6;
}

.login-btn {
    padding: 6px 16px;
    border: 1px solid #d1d5db;
    border-radius: 9999px;
    cursor: pointer;
    transition: background-color 0.2s, color 0.2s;
}

.login-btn:hover {
    background-color: #f3f4f6;
}

.main-container {

    text-align: center;
    position: absolute;
    top: 35%;
    left: 50%;
    transform: translate(-50%, -50%);
}

.main-title {
    font-size: 36px;
    font-weight: bold;
    margin-bottom: 20px;
}

.url-input {
    padding: 12px 24px;
    border: 1px solid #e5e7eb;
    border-radius: 9999px;
    outline: none;
    width: 250px;
    font-size: 14px;
    color: #6b7280;
}

.url-input::placeholder {
    color: #9ca3af;
}
</style>