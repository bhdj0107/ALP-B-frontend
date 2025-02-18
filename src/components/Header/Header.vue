<script setup lang="ts">
    import UserProfile from './UserProfile.vue';
    import type { UserProfileProps } from './UserProfile.vue';


    defineProps<{
        content: string
    }>();


    const user: UserProfileProps['user'] | undefined = undefined;


</script>

<template>
    <header class="header">
        <div class="logo-section">
            <router-link to="/" custom v-slot="{ navigate }">
                <div class="logo-link" @click="navigate">
                    <h1>{{ content }}</h1>
                </div>
            </router-link>
        </div>
        <UserProfile :user="user" />
    </header>
</template>

<script lang="ts">
export default {
    name: 'Header'
}
</script>

<style scoped>
.header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    display: flex;
    flex-shrink: 0;
    width: 100%;
    background-color: #fab6cc; /* 헤더 배경색 */
    height: 4rem;
    color: #4a1c2e; /* 변경: 헤더 텍스트 색상 */
    padding: 0 2rem;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.logo-section h1 {
    color: var(--color-text-white) !important;
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0;
}

.logo-link {
    text-decoration: none;
    color: inherit;
    transition: opacity 0.3s ease;
    cursor: pointer;
    background: none;
}

.logo-link:hover {
    opacity: 0.9;
    background: none;
}

</style>