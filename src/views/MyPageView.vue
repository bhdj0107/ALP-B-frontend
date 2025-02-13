<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import { ref } from 'vue';

const auth = useAuthStore();
const isEditing = ref(false);
const isChangingPassword = ref(false);

const editForm = ref({
    name: auth.user?.name || '',
    email: auth.user?.email || '',
    avatar: auth.user?.avatar || ''
});

const passwordForm = ref({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
});

const startEditing = () => {
    isEditing.value = true;
    editForm.value = {
        name: auth.user?.name || '',
        email: auth.user?.email || '',
        avatar: auth.user?.avatar || ''
    };
};

const cancelEditing = () => {
    isEditing.value = false;
};

const saveChanges = () => {
    // TODO: API 호출로 변경
    auth.user = {
        ...auth.user!,
        name: editForm.value.name,
        email: editForm.value.email,
        avatar: editForm.value.avatar
    };
    isEditing.value = false;
};

const startChangingPassword = () => {
    isChangingPassword.value = true;
    passwordForm.value = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    };
};

const cancelChangingPassword = () => {
    isChangingPassword.value = false;
};

const savePasswordChanges = () => {
    // TODO: API 호출로 변경
    if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
        alert('새 비밀번호가 일치하지 않습니다.');
        return;
    }
    console.log('Password changed:', passwordForm.value);
    isChangingPassword.value = false;
};
</script>

<template>
    <div class="mypage">
        <div class="mypage-container">
            <div class="profile-section" :class="{ 'editing': isEditing || isChangingPassword }">
                <div class="profile-content">
                    <img :src="auth.user?.avatar" alt="Profile Image" class="profile-image">
                    <h1>{{ auth.user?.name }}</h1>
                    <p>{{ auth.user?.email }}</p>
                </div>
                <div v-if="isEditing" class="edit-form">
                    <div class="form-group">
                        <label>이름</label>
                        <input type="text" v-model="editForm.name">
                    </div>
                    <div class="form-group">
                        <label>이메일</label>
                        <input type="email" v-model="editForm.email">
                    </div>
                    <div class="form-group">
                        <label>프로필 이미지 URL</label>
                        <input type="text" v-model="editForm.avatar">
                    </div>
                </div>
                <div v-if="isChangingPassword" class="edit-form">
                    <h2>비밀번호 변경</h2>
                    <div class="form-group">
                        <label>현재 비밀번호</label>
                        <input 
                            type="password" 
                            v-model="passwordForm.currentPassword"
                            placeholder="현재 비밀번호를 입력하세요"
                        >
                    </div>
                    <div class="form-group">
                        <label>새 비밀번호</label>
                        <input 
                            type="password" 
                            v-model="passwordForm.newPassword"
                            placeholder="새 비밀번호를 입력하세요"
                        >
                    </div>
                    <div class="form-group">
                        <label>새 비밀번호 확인</label>
                        <input 
                            type="password" 
                            v-model="passwordForm.confirmPassword"
                            placeholder="새 비밀번호를 다시 입력하세요"
                        >
                    </div>
                </div>
            </div>
            
            <div class="content-section">
                <div class="section-card">
                    <h2>내 반려동물</h2>
                    <p>등록된 반려동물이 없습니다.</p>
                    <button class="add-button">반려동물 등록</button>
                </div>
                <div class="section-card">
                    <h2>예약 내역</h2>
                    <p>예약 내역이 없습니다.</p>
                </div>
                <div class="section-card">
                    <h2>계정 설정</h2>
                    <button 
                        v-if="!isEditing && !isChangingPassword" 
                        class="settings-button" 
                        @click="startEditing"
                    >
                        프로필 수정
                    </button>
                    <template v-if="isEditing">
                        <button class="save-button" @click="saveChanges">수정 완료</button>
                        <button class="cancel-button" @click="cancelEditing">취소</button>
                    </template>
                    <button 
                        v-if="!isEditing && !isChangingPassword" 
                        class="settings-button" 
                        @click="startChangingPassword"
                    >
                        비밀번호 변경
                    </button>
                    <template v-if="isChangingPassword">
                        <button class="save-button" @click="savePasswordChanges">변경 완료</button>
                        <button class="cancel-button" @click="cancelChangingPassword">취소</button>
                    </template>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.mypage {
    padding: 2rem;
    background-color: #f5f5f5;
    min-height: calc(100vh - 4rem);
}

.mypage-container {
    max-width: 1200px;
    margin: 0 auto;
}

.profile-section {
    display: flex;
    background: white;
    padding: 2rem;
    border-radius: 10px;
    margin-bottom: 2rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
}

.profile-section.editing {
    gap: 2rem;
}

.profile-content {
    flex: 1;
    text-align: center;
}

.edit-form {
    flex: 1;
    padding-left: 2rem;
    border-left: 1px solid #eee;
}

.form-group {
    margin-bottom: 1rem;
}

.form-group label {
    display: block;
    margin-bottom: 0.5rem;
    color: #666;
    font-size: 0.9rem;
}

.form-group input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
}

.save-button {
    background: linear-gradient(to right, #2c3338, #4a4f54);
    color: white;
    margin-bottom: 0.5rem;
}

.cancel-button {
    background: transparent;
    border: 1px solid #dc3545;
    color: #dc3545;
    margin-bottom: 0.5rem;
}

.cancel-button:hover {
    background: #dc3545;
    color: white;
}

.profile-image {
    width: 120px;
    height: 120px;
    border-radius: 60px;
    margin-bottom: 1rem;
    object-fit: cover;
    border: 3px solid #f5f5f5;
}

.content-section {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
}

.section-card {
    background: white;
    padding: 2rem;
    border-radius: 10px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

h1 {
    color: #333;
    margin-bottom: 0.5rem;
}

h2 {
    color: #333;
    margin-bottom: 1rem;
    font-size: 1.2rem;
}

p {
    color: #666;
    margin-bottom: 1rem;
}

button {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 4px;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.3s ease;
    background: linear-gradient(to right, #2c3338, #4a4f54);
    color: white;
    width: 100%;
    margin-bottom: 0.5rem;
}

button:hover {
    opacity: 0.9;
}

.settings-button {
    background: transparent;
    border: 1px solid #2c3338;
    color: #2c3338;
}

.settings-button:hover {
    background: #2c3338;
    color: white;
}

.edit-form h2 {
    margin-bottom: 1.5rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #eee;
}

.form-group input[type="password"] {
    letter-spacing: 0.1em;
}

@media (max-width: 768px) {
    .profile-section {
        flex-direction: column;
    }

    .edit-form {
        padding-left: 0;
        border-left: none;
        border-top: 1px solid #eee;
        padding-top: 1rem;
        margin-top: 1rem;
    }
}
</style> 