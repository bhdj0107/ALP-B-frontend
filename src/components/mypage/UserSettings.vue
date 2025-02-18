<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const auth = useAuthStore();
const router = useRouter();
const isEditing = ref(false);
const isChangingPassword = ref(false);
const isResigning = ref(false);

const editForm = ref({
    name: '',
    email: '',
    avatar: '',
    phone: ''
});

const passwordForm = ref({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
});

const resignForm = ref({
    confirmText: '',
    password: ''
});

const avatarInput = ref('');
const fileInput = ref<HTMLInputElement | null>(null);
const isUploading = ref(false);

const startEditing = () => {
    isEditing.value = true;
    editForm.value = {
        name: auth.user?.name ?? '',
        email: auth.user?.email ?? '',
        avatar: auth.user?.avatar ?? '',
        phone: auth.user?.phone ?? ''
    };
    avatarInput.value = editForm.value.avatar;
};

const cancelEditing = () => {
    isEditing.value = false;
};

const saveChanges = async () => {
    try {
        await auth.updateProfile({
            name: editForm.value.name,
            email: editForm.value.email,
            phone: editForm.value.phone,
            avatar: avatarInput.value
        });
        isEditing.value = false;
        alert('프로필이 성공적으로 수정되었습니다.');
    } catch (error) {
        alert('프로필 수정에 실패했습니다.');
        console.error(error);
    }
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

const savePasswordChanges = async () => {
    try {
        if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
            alert('새 비밀번호가 일치하지 않습니다.');
            return;
        }
        await auth.updatePassword(
            passwordForm.value.currentPassword,
            passwordForm.value.newPassword
        );
        alert('비밀번호가 변경되었습니다. 다시 로그인해주세요.');
        router.push('/login');
    } catch (error) {
        if (error instanceof Error) {
            alert(error.message);
        } else {
            alert('비밀번호 변경에 실패했습니다.');
        }
        console.error(error);
    }
};

const handleAvatarInput = (event: Event) => {
    const input = event.target as HTMLInputElement;
    avatarInput.value = input.value;
    editForm.value.avatar = input.value;
};

const handleFileSelect = async (event: Event) => {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 업로드 가능합니다.');
        return;
    }

    isUploading.value = true;
    try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/v1/user/avatar', {
            method: 'POST',
            credentials: 'include',
            body: formData
        });

        if (!response.ok) {
            throw new Error(await response.text());
        }

        const avatarUrl = await response.text();
        avatarInput.value = avatarUrl;
        editForm.value.avatar = avatarUrl;
    } catch (error) {
        console.error('이미지 업로드 에러:', error);
        alert('이미지 업로드에 실패했습니다.');
    } finally {
        isUploading.value = false;
    }
};

const startResigning = () => {
    isResigning.value = true;
    resignForm.value = {
        confirmText: '',
        password: ''
    };
};

const cancelResigning = () => {
    isResigning.value = false;
};

const handleResign = async () => {
    try {
        if (resignForm.value.confirmText !== '탈퇴하겠습니다.') {
            alert('확인 문구를 정확히 입력해주세요.');
            return;
        }

        const resignResponse = await fetch('/api/v1/user/resign', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ 
                password: resignForm.value.password 
            })
        });

        if (!resignResponse.ok) {
            const errorText = await resignResponse.text();
            throw new Error(errorText);
        }

        // auth store의 clearAuthState 메서드 사용
        auth.clearAuthState();
        
        alert('회원 탈퇴가 완료되었습니다. 이용해 주셔서 감사합니다.');
        router.push('/');
    } catch (error) {
        console.error('회원 탈퇴 에러:', error);
        alert(error instanceof Error ? error.message : '회원 탈퇴 처리 중 오류가 발생했습니다.');
    }
};
</script>

<template>
    <div class="user-settings">
        <div v-if="!isEditing && !isChangingPassword && !isResigning" class="settings-buttons">
            <button class="settings-button" @click="startEditing">
                프로필 수정
            </button>
            <button class="settings-button" @click="startChangingPassword">
                비밀번호 변경
            </button>
            <button class="resign-button" @click="startResigning">
                회원 탈퇴
            </button>
        </div>

        <!-- 프로필 수정 폼 -->
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
                <label>프로필 이미지</label>
                <div class="avatar-upload">
                    <input 
                        type="file" 
                        ref="fileInput"
                        accept="image/*"
                        @change="handleFileSelect"
                        class="file-input"
                    >
                    <button 
                        class="upload-button" 
                        @click="() => fileInput?.click()"
                        :disabled="isUploading"
                    >
                        {{ isUploading ? '업로드 중...' : '이미지 선택' }}
                    </button>
                </div>
                <div class="avatar-preview">
                    <img :src="avatarInput" alt="Avatar Preview" 
                         @error="editForm.avatar = 'https://placehold.co/64'" 
                         class="preview-image">
                </div>
            </div>
            <div class="form-group">
                <label>전화번호</label>
                <input type="text" v-model="editForm.phone">
            </div>
            <div class="button-group">
                <button class="save-button" @click="saveChanges">수정 완료</button>
                <button class="cancel-button" @click="cancelEditing">취소</button>
            </div>
        </div>

        <!-- 비밀번호 변경 폼 -->
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
            <div class="button-group">
                <button class="save-button" @click="savePasswordChanges">변경 완료</button>
                <button class="cancel-button" @click="cancelChangingPassword">취소</button>
            </div>
        </div>

        <!-- 회원 탈퇴 폼 -->
        <div v-if="isResigning" class="edit-form resign-form">
            <h2>회원 탈퇴</h2>
            <div class="warning-box">
                <h3>탈퇴 전 꼭 확인해주세요!</h3>
                <ul>
                    <li>탈퇴 시 모든 개인정보가 삭제되며 복구할 수 없습니다.</li>
                    <li>진행 중인 예약이 있다면 탈퇴가 제한될 수 있습니다.</li>
                    <li>작성하신 리뷰는 삭제되지 않습니다.</li>
                </ul>
            </div>
            <div class="form-group">
                <label>탈퇴 확인</label>
                <input 
                    type="text" 
                    v-model="resignForm.confirmText"
                    placeholder="'탈퇴하겠습니다.' 를 입력해주세요."
                >
            </div>
            <div class="form-group">
                <label>비밀번호 확인</label>
                <input 
                    type="password" 
                    v-model="resignForm.password"
                    placeholder="현재 비밀번호를 입력해주세요"
                >
            </div>
            <div class="button-group">
                <button 
                    class="resign-confirm-button" 
                    @click="handleResign"
                    :disabled="resignForm.confirmText !== '탈퇴하겠습니다.' || !resignForm.password"
                >
                    탈퇴하기
                </button>
                <button class="cancel-button" @click="cancelResigning">취소</button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.settings-buttons {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;
}

.settings-button {
    background: white;
    border: 1px solid #4263EB;
    color: #4263EB;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 500;
}

.settings-button:hover {
    background: #4263EB;
    color: white;
}

.edit-form {
    max-width: 600px;
}

.form-group {
    margin-bottom: 1.5rem;
}

.form-group label {
    display: block;
    margin-bottom: 0.5rem;
    color: #666;
    font-weight: 500;
}

.form-group input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
}

.avatar-upload {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
}

.file-input {
    display: none;
}

.avatar-preview {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    overflow: hidden;
    border: 2px solid #eee;
}

.preview-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.button-group {
    display: flex;
    gap: 1rem;
    margin-top: 2rem;
}

.save-button, .cancel-button {
    flex: 1;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 500;
}

.save-button {
    background: #4263EB;
    color: white;
    border: none;
}

.save-button:hover {
    background: #3b5bdb;
}

.cancel-button {
    background: white;
    border: 1px solid #dc3545;
    color: #dc3545;
}

.cancel-button:hover {
    background: #dc3545;
    color: white;
}

.upload-button {
    padding: 0.5rem 1rem;
    background: #4263EB;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: opacity 0.3s;
}

.upload-button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

.resign-button {
    background: white;
    border: 1px solid #dc3545;
    color: #dc3545;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 500;
}

.resign-button:hover {
    background: #dc3545;
    color: white;
}

.resign-form {
    max-width: 600px;
}

.warning-box {
    background: #fff3f3;
    border: 1px solid #ffcdd2;
    border-radius: 8px;
    padding: 1.5rem;
    margin-bottom: 2rem;
}

.warning-box h3 {
    color: #dc3545;
    margin-bottom: 1rem;
    font-size: 1.1rem;
}

.warning-box ul {
    color: #666;
    padding-left: 1.5rem;
}

.warning-box li {
    margin-bottom: 0.5rem;
}

.resign-confirm-button {
    flex: 1;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 500;
    background: #dc3545;
    color: white;
    border: none;
}

.resign-confirm-button:disabled {
    background: #f5f5f5;
    color: #999;
    cursor: not-allowed;
    border: 1px solid #ddd;
}

.resign-confirm-button:not(:disabled):hover {
    background: #c82333;
}
</style> 