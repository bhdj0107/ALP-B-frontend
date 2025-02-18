<script setup lang="ts">
    import Header from './components/Header/Header.vue';
    import { useAuthStore } from '@/stores/auth';
    import { onMounted } from 'vue';
    const auth = useAuthStore();

    onMounted(async () => {
        await auth.checkSession();
    });
</script>

<template>
    <div class="app">
        <Header :content="'ALP Pet Care'"/>
        <div class="content-box">
            <router-view></router-view>
        </div>
    </div>
</template>

<style>
/* 전역 스타일을 추가해보세요 */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body, html {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    overflow-x: hidden;
}

/* router-link 기본 스타일 완전 제거 */
:deep(a.router-link-active),
:deep(a.router-link-exact-active),
:deep(.router-link-active),
:deep(.router-link-exact-active),
a.router-link-active,
a.router-link-exact-active,
.router-link-active,
.router-link-exact-active {
    background-color: transparent !important;
    color: inherit !important;
    -webkit-tap-highlight-color: transparent !important;
}

/* 모든 router-link 호버 효과 제거 */
:deep(a.router-link-active:hover),
:deep(a.router-link-exact-active:hover),
:deep(.router-link-active:hover),
:deep(.router-link-exact-active:hover),
a.router-link-active:hover,
a.router-link-exact-active:hover,
.router-link-active:hover,
.router-link-exact-active:hover {
    background-color: transparent !important;
}
</style>

<style scoped>
    .app {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
        width: 100%;
        margin: 0;
        padding: 0;
    }
    .content-box {
        margin-top: 4rem;
        width: 200%;
        flex: 1;
        background-color: #f5f5f5;
    }
</style>
