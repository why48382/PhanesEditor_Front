<script setup>
import { RouterLink } from 'vue-router';


</script>

<template>
    <div class="top-bar">
        <h1>

            <RouterLink :to="{ name: 'main' }">
                Phanes
            </RouterLink>
        </h1>
        <div class="profile-icon">
            <img src="https://lh3.googleusercontent.com/a/ACg8ocIYJXGITMJfJ8BKyRNsFD3n3RPixBPQSWutwuhHxb44cBr74cFC=s288-c-no"
                class="profile-img" alt="임시 이미지">
        </div>
    </div>
</template>

<style scoped>
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

.profile-icon {
    margin-right: 10px;
}

.profile-img {
    width: 25px
}
</style>