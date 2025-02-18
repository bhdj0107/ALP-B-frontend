<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';

const auth = useAuthStore();
</script>

<template>
    <div class="profile-content">
        <img :src="auth.user?.avatar" alt="Profile Image" class="profile-image">
        <h1>{{ auth.user?.name }}</h1>
        <p>{{ auth.user?.email }}</p>
        <p class="phone-number">{{ auth.user?.phone || '전화번호 미등록' }}</p>
    </div>
</template>

<style scoped>
.profile-content {
    text-align: center;
}

.profile-image {
    width: 120px;
    height: 120px;
    border-radius: 60px;
    margin-bottom: 1rem;
    object-fit: cover;
    border: 3px solid #f5f5f5;
}

.phone-number {
    color: #666;
    font-size: 0.9rem;
    margin-top: 0.25rem;
}
</style> 