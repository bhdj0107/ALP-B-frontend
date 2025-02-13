<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const auth = useAuthStore();
const formData = ref({
    email: '',
    password: ''
});

const handleSubmit = async () => {
    try {
        await auth.login(formData.value.email, formData.value.password);
        router.push('/');
    } catch (error) {
        console.error('Login failed:', error);
        // TODO: 에러 처리
    }
};

const goToSignup = () => {
    router.push('/signup');
};
</script>

<template>
    <div class="login">
        <div class="login-container">
            <h1>로그인</h1>
            <form @submit.prevent="handleSubmit">
                <div class="form-group">
                    <label for="email">이메일</label>
                    <input 
                        type="email" 
                        id="email"
                        v-model="formData.email"
                        required
                    >
                </div>
                <div class="form-group">
                    <label for="password">비밀번호</label>
                    <input 
                        type="password" 
                        id="password"
                        v-model="formData.password"
                        required
                    >
                </div>
                <button type="submit">로그인</button>
                <div class="signup-prompt">
                    계정이 없으신가요? 
                    <a href="#" @click.prevent="goToSignup">회원가입</a>
                </div>
            </form>
        </div>
    </div>
</template>

<style scoped>
.login {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: calc(100vh - 4rem);
    background-color: #f5f5f5;
}

.login-container {
    background: white;
    padding: 2rem;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 400px;
}

h1 {
    text-align: center;
    color: #333;
    margin-bottom: 2rem;
}

.form-group {
    margin-bottom: 1.5rem;
}

label {
    display: block;
    margin-bottom: 0.5rem;
    color: #666;
}

input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
    transition: border-color 0.3s ease;
}

input:focus {
    outline: none;
    border-color: #4a4f54;
}

button {
    width: 100%;
    padding: 0.75rem;
    background: linear-gradient(to right, #2c3338, #4a4f54);
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    transition: opacity 0.3s ease;
}

button:hover {
    opacity: 0.9;
}

.signup-prompt {
    margin-top: 1rem;
    text-align: center;
    color: #666;
}

.signup-prompt a {
    color: #2c3338;
    text-decoration: none;
    font-weight: 500;
    margin-left: 0.5rem;
}

.signup-prompt a:hover {
    text-decoration: underline;
}
</style> 