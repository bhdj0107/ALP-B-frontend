<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

import UserProfile from '@/components/mypage/UserProfile.vue';
import PetManagement from '@/components/mypage/PetManagement.vue';
import PetsitterManagement from '@/components/mypage/PetsitterManagement.vue';
import ReservationHistory from '@/components/mypage/ReservationHistory.vue';
import UserSettings from '@/components/mypage/UserSettings.vue';
import AdminManagement from '@/components/mypage/AdminManagement.vue';

const auth = useAuthStore();
const router = useRouter();
const activeTab = ref('pets');

// 추가: 관리자 여부 확인
const isAdmin = ref(auth.user?.admin === true);

// 탭 목록을 계산된 속성으로 변경
const tabs = computed(() => {
  const baseTabs = ['pets', 'petsitter', 'reservations', 'settings'];
  return isAdmin.value ? [...baseTabs, 'admin'] : baseTabs;
});

// 로그인 상태 체크 및 리다이렉트
onMounted(() => {
    if (!auth.isAuthenticated) {
        router.push('/login');
        return;
    }
});

const switchTab = (tab: string) => {
    activeTab.value = tab;
};
</script>

<template>
    <div v-if="auth.isAuthenticated" class="mypage">
        <div class="mypage-container">
            <!-- 왼쪽 사이드바 -->
            <div class="sidebar">
                <UserProfile />
            </div>

            <!-- 오른쪽 컨텐츠 영역 -->
            <div class="main-content">
                <!-- 탭 네비게이션 -->
                <div class="tab-navigation">
                    <button 
                        v-for="tab in tabs"
                        :key="tab"
                        :class="['tab-button', { 
                            active: activeTab === tab,
                            'admin-tab': tab === 'admin' 
                        }]"
                        @click="switchTab(tab)"
                    >
                        {{ {
                            pets: '반려동물 관리',
                            petsitter: '펫시터 관리',
                            reservations: '예약 내역',
                            settings: '회원정보 수정',
                            admin: '관리자 페이지'
                        }[tab] }}
                    </button>
                </div>

                <!-- 탭 컨텐츠 -->
                <div class="tab-content">
                    <PetManagement v-if="activeTab === 'pets'" />
                    <PetsitterManagement v-if="activeTab === 'petsitter'" />
                    <ReservationHistory v-if="activeTab === 'reservations'" />
                    <UserSettings v-if="activeTab === 'settings'" />
                    <AdminManagement v-if="activeTab === 'admin'" />
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
    display: flex;
    gap: 2rem;
}

/* admin 탭일 때의 스타일 */
.mypage-container:has(.admin-management) {
    max-width: 1600px;
}

.sidebar {
    width: 300px;
    flex-shrink: 0;
    background: white;
    padding: 2rem;
    border-radius: 10px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    height: fit-content;
}

.main-content {
    flex: 1;
    min-width: 0; /* 중요: flexbox 내에서 오버플로우 방지 */
    background: white;
    border-radius: 10px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    overflow: hidden;
}

.tab-navigation {
    display: flex;
    border-bottom: 1px solid #eee;
    background: #f8f9fa;
}

.tab-button {
    padding: 1rem 2rem;
    background: none;
    border: none;
    color: #666;
    font-size: 1rem;
    cursor: pointer;
    margin: 0;
    width: auto;
}

.tab-button.active {
    color: #2c3338;
    border-bottom: 2px solid #2c3338;
    background: white;
}

.tab-button:hover {
    background: rgba(0, 0, 0, 0.05);
}

.tab-button.admin-tab.active {
    border-bottom-color: #dc3545;
    color: #dc3545;
}

.tab-content {
    width: 100%;
    padding: 2rem;
}

@media (max-width: 1800px) {
    .mypage-container:has(.admin-management) {
        margin: 0 2rem;
    }
}

@media (max-width: 768px) {
    .mypage-container,
    .mypage-container:has(.admin-management) {
        flex-direction: column;
        margin: 0;
    }

    .sidebar {
        width: 100%;
    }

    .main-content {
        width: 100%;
        overflow-x: auto;
    }

    .tab-navigation {
        flex-direction: column;
    }

    .tab-button {
        width: 100%;
        text-align: left;
    }
}
</style> 