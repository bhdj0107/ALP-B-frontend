<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const auth = useAuthStore();

const handleLogout = () => {
    auth.logout();
};

const goToLogin = () => {
    router.push('/login');
};

const goToSignup = () => {
    router.push('/signup');
};

const goToMyPage = () => {
    router.push('/mypage');
};
</script>

<template>
    <div class="user-profile">
        <template v-if="auth.isAuthenticated">
            <div class="profile-section" @click="goToMyPage">
                <h2>{{ auth.user?.name }}</h2>
                <p>{{ auth.user?.email }}</p>
                <img :src="auth.user?.avatar" alt="User Avatar">
            </div>
            <button @click="handleLogout" class="logout-btn">로그아웃</button>
        </template>
        <template v-else>
            <p class="login-message">로그인이 필요합니다!</p>
            <button @click="goToLogin" class="login-btn">로그인</button>
            <button @click="goToSignup" class="signup-btn">회원가입</button>
        </template>
    </div>
</template>

<script lang="ts">

export default {
    name: 'UserProfile'
};




</script>



<style scoped>
.user-profile {
    display: flex;
    flex-direction: row;
    align-items: center;
    background-color: rgba(255, 255, 255, 0.08);
    padding: 0.5rem 1rem;
    border-radius: 2rem;
    max-width: 100%;
    height: 2.5rem;
    margin: 0;
    transition: all 0.3s ease;
    gap: 1rem;
}

.user-profile:hover {
    background-color: rgba(255, 255, 255, 0.15);
}

.user-profile h2 {
    font-size: 0.9rem;
    margin: 0 10px;
    color: white;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.user-profile p {
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.8);
    margin: 0 10px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.user-profile img {
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    object-fit: cover;
    margin: 0;
    border: 2px solid rgba(255, 255, 255, 0.3);
    transition: all 0.3s ease;
}

.user-profile img:hover {
    border-color: rgba(255, 255, 255, 0.8);
    transform: scale(1.05);
}

.login-message {
    color: rgba(255, 255, 255, 0.8);
    margin: 0;
    font-size: 0.9rem;
}

.login-btn, .signup-btn, .logout-btn {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.3s ease;
}

.login-btn {
    background-color: rgba(255, 255, 255, 0.9);
    color: #2c3338;
}

.signup-btn {
    background-color: transparent;
    color: rgba(255, 255, 255, 0.9);
    border: 1px solid rgba(255, 255, 255, 0.9);
}

.logout-btn {
    background-color: transparent;
    color: rgba(255, 255, 255, 0.9);
    border: 1px solid rgba(255, 255, 255, 0.9);
}

.login-btn:hover, .signup-btn:hover, .logout-btn:hover {
    transform: translateY(-1px);
    opacity: 0.9;
}

.profile-section {
    display: flex;
    align-items: center;
    cursor: pointer;
    transition: all 0.3s ease;
}

.profile-section:hover {
    opacity: 0.8;
}
</style>