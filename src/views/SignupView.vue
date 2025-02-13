<script setup lang="ts">
import { ref } from 'vue';

const formData = ref({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
});

const handleSubmit = () => {
    // TODO: Implement signup logic
    console.log('Form submitted:', formData.value);
};
</script>

<template>
    <div class="signup">
        <div class="signup-container">
            <h1>회원가입</h1>
            <form @submit.prevent="handleSubmit">
                <div class="form-group">
                    <label for="username">이름</label>
                    <input 
                        type="text" 
                        id="username"
                        v-model="formData.username"
                        required
                    >
                </div>
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
                <div class="form-group">
                    <label for="confirmPassword">비밀번호 확인</label>
                    <input 
                        type="password" 
                        id="confirmPassword"
                        v-model="formData.confirmPassword"
                        required
                    >
                </div>
                <button type="submit">가입하기</button>
            </form>
        </div>
    </div>
</template>

<style scoped>
.signup {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: calc(100vh - 4rem);
    background-color: #f5f5f5;
}

.signup-container {
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
</style> 