<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();

const formData = ref({
    name: '',
    email: '',
    password: '',
    phone: '',
    confirmPassword: ''
});

const handleSignup = async () => {
    try {
        // 비밀번호 확인 검증
        if (formData.value.password !== formData.value.confirmPassword) {
            alert('비밀번호가 일치하지 않습니다.');
            return;
        }

        // API 요청 데이터에서 confirmPassword 제외
        const { confirmPassword, ...signupData } = formData.value;
        
        const response = await axios.post('http://172.30.1.36:8080/api/v1/user/signup', signupData);
        if (response.status === 200) {
            alert('회원가입이 완료되었습니다.');
            router.push('/login');
        }
    } catch (error: any) {
        if (error.response?.status === 401) {
            alert('회원가입 권한이 없습니다.');
        } else if (error.response?.status === 500) {
            alert('서버 오류가 발생했습니다.');
        } else {
            alert('회원가입 중 오류가 발생했습니다.');
        }
    }
};
</script>

<template>
    <div class="signup">
        <div class="signup-container">
            <h2>회원가입</h2>
            <form @submit.prevent="handleSignup" class="signup-form">
                <div class="form-group">
                    <label for="name">이름</label>
                    <input 
                        type="text" 
                        id="name"
                        v-model="formData.name"
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
                <div class="form-group">
                    <label for="phone">전화번호</label>
                    <input 
                        type="tel" 
                        id="phone"
                        v-model="formData.phone"
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

h2 {
    text-align: center;
    color: #333;
    margin-bottom: 2rem;
}

.signup-form {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

label {
    font-weight: bold;
}

input {
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
}

button {
    padding: 10px;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

button:hover {
    background-color: #45a049;
}
</style> 