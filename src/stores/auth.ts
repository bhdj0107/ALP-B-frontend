import { defineStore } from 'pinia'
import { ref } from 'vue'

// API 기본 URL 상수 정의
const API_BASE_URL = 'http://localhost:8080/api/v1/user'

interface UserData {
    id: number;
    name: string;
    email: string;
    phone: string;
    signupDate: string;
    avatar: string; // 필수 필드로 변경
    isAdmin: boolean;
}

export const useAuthStore = defineStore('auth', () => {
    const isAuthenticated = ref(false)
    const user = ref<UserData | null>(null)

    // 회원가입
    const signup = async (userData: { email: string; password: string; name: string; phone: string }) => {
        try {
            const response = await fetch(`${API_BASE_URL}/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(userData)
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(errorData);
            }

            return await response.text();
        } catch (error) {
            console.error('Signup failed:', error);
            throw error;
        }
    }

    // 로그인
    const login = async (email: string, password: string) => {
        try {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ email, password })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText);
            }

            // 로그인 성공 시 세션 정보 가져오기
            await checkSession();
            
            return await response.text();
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    // 로그아웃
    const logout = async () => {
        try {
            // 로그아웃 API 호출이 실패하더라도 로컬 상태는 초기화
            try {
                await fetch(`${API_BASE_URL}/logout`, {
                    credentials: 'include'
                });
            } catch (error) {
                console.error('Logout API call failed:', error);
            }
            
            // 로컬 상태 초기화
            isAuthenticated.value = false;
            user.value = null;
        } catch (error) {
            console.error('Logout failed:', error);
            throw error;
        }
    }

    // 로컬 상태만 초기화
    const resetState = () => {
        isAuthenticated.value = false;
        user.value = null;
    }

    // 세션 체크
    const checkSession = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/session`, {
                credentials: 'include'
            });
            if (!response.ok) {
                isAuthenticated.value = false;
                user.value = null;
                return;
            }
            const userData = await response.json();
            isAuthenticated.value = true;
            user.value = {
                ...userData,
                // 서버에서 avatar가 없을 경우에만 기본 이미지 사용
                avatar: userData.avatar || 'https://placehold.co/64'
            };
        } catch (error) {
            console.error('Session check failed:', error);
            isAuthenticated.value = false;
            user.value = null;
        }
    }

    // 프로필 정보 수정
    const updateProfile = async (userData: { email: string; name: string; phone: string; avatar: string }) => {
        try {
            const response = await fetch(`${API_BASE_URL}/info`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(userData)
            });

            if (!response.ok) {
                throw new Error(await response.text());
            }

            await checkSession();
            return await response.text();
        } catch (error) {
            console.error('Profile update failed:', error);
            throw error;
        }
    }

    // 비밀번호 변경
    const updatePassword = async (currentPassword: string, newPassword: string) => {
        try {
            const response = await fetch(`${API_BASE_URL}/reset`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    currentPassword,
                    newPassword
                })
            });

            if (!response.ok) {
                throw new Error(await response.text());
            }

            // 비밀번호 변경 후 자동 로그아웃
            isAuthenticated.value = false;
            user.value = null;
            
            return await response.text();
        } catch (error) {
            console.error('Password update failed:', error);
            throw error;
        }
    }

    // 상태 초기화 메서드 추가
    const clearAuthState = () => {
        isAuthenticated.value = false;
        user.value = null;
    }

    return {
        isAuthenticated,
        user,
        signup,
        login,
        logout,
        checkSession,
        updateProfile,
        updatePassword,
        resetState,
        clearAuthState
    }
}) 