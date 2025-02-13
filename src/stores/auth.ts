import { defineStore } from 'pinia'
import { ref } from 'vue'

interface UserData {
    name: string;
    email: string;
    avatar: string;
}

export const useAuthStore = defineStore('auth', () => {
    const isAuthenticated = ref(false)
    const user = ref<UserData | null>(null)

    // 로그인 액션
    const login = async (email: string, password: string) => {
        try {
            // TODO: API 호출
            console.log('Login with:', email, password)
            isAuthenticated.value = true
            user.value = {
                name: '테스트 유저',
                email: email,
                avatar: 'https://placehold.co/64'
            }
        } catch (error) {
            console.error('Login failed:', error)
            throw error
        }
    }

    // 로그아웃 액션
    const logout = () => {
        isAuthenticated.value = false
        user.value = null
    }

    // 세션 체크 액션
    const checkSession = async () => {
        try {
            // TODO: getSession API 호출
            const response = await fetch('/api/session')
            const data = await response.json()
            isAuthenticated.value = data.isAuthenticated
            user.value = data.user
        } catch (error) {
            console.error('Session check failed:', error)
            isAuthenticated.value = false
            user.value = null
        }
    }

    return {
        isAuthenticated,
        user,
        login,
        logout,
        checkSession
    }
}) 