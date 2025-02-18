<template>
    <div class="petsitter-view">
        <h1>반려동물 펫시터</h1>
        
        <!-- 펫시터 목록 -->
        <div class="petsitter-grid">
            <div v-for="petsitter in petsitters" 
                 :key="petsitter.id" 
                 class="petsitter-card">
                <div class="petsitter-info">
                    <div class="petsitter-info-left">
                        <h3>{{ petsitter.name }}</h3>
                        <div class="rating">
                            <span class="stars">★★★★★</span>
                            <span class="rating-text">{{ petsitter.rating.toFixed(1) }}</span>
                            <span class="review-count">({{ petsitter.reviewCount }})</span>
                        </div>
                        <p class="location">
                            <span class="info-label">활동 지역</span>
                            {{ petsitter.location }}
                        </p>
                        <p class="available-time">
                            <span class="info-label">이용시간</span>
                            {{ petsitter.availableTime }}
                        </p>
                    </div>
                    <div class="petsitter-info-right">
                        <p class="price">시간당 {{ formatPrice(petsitter.price) }}원</p>
                    </div>
                </div>
                
                <div class="services">
                    <span class="info-label">서비스</span>
                    <span class="service-tag" v-for="service in petsitter.services" :key="service">
                        {{ service }}
                    </span>
                </div>

                <p class="introduction"><span class="info-label">소개글</span> {{ petsitter.introduction }}</p>
                
                <button class="reserve-button" @click="openReservationModal(petsitter)">
                    예약하기
                </button>
            </div>
        </div>

        <!-- 페이지네이션 -->
        <div class="pagination">
            <button 
                :disabled="currentPage === 0" 
                @click="changePage(currentPage - 1)"
                class="page-button"
            >
                이전
            </button>
            <span class="page-info">{{ currentPage + 1 }} / {{ totalPages }}</span>
            <button 
                :disabled="!hasNext" 
                @click="changePage(currentPage + 1)"
                class="page-button"
            >
                다음
            </button>
        </div>

        <!-- 예약 모달 -->
        <div v-if="showModal" class="modal-overlay" @click="closeModal">
            <div class="modal-content" @click.stop>
                <h2>예약하기</h2>
                <form @submit.prevent="submitReservation">
                    <div class="form-group">
                        <label>시작 시간</label>
                        <div class="datetime-picker">
                            <input 
                                type="datetime-local" 
                                v-model="reservationForm.startTime"
                                @change="updateEstimatedPrice"
                                required
                                :min="minDateTime"
                            >
                            <div class="datetime-buttons">
                                <button type="button" class="datetime-button cancel" @click="resetStartTime">
                                    취소
                                </button>
                                <button type="button" class="datetime-button confirm" @click="confirmStartTime">
                                    확인
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>종료 시간</label>
                        <div class="datetime-picker">
                            <input 
                                type="datetime-local" 
                                v-model="reservationForm.endTime"
                                @change="updateEstimatedPrice"
                                required
                                :min="reservationForm.startTime || minDateTime"
                            >
                            <div class="datetime-buttons">
                                <button type="button" class="datetime-button cancel" @click="resetEndTime">
                                    취소
                                </button>
                                <button type="button" class="datetime-button confirm" @click="confirmEndTime">
                                    확인
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>원하는 서비스 선택 (1개 이상)</label>
                        <div class="service-selection">
                            <div v-for="service in selectedPetsitter?.services" 
                                 :key="service" 
                                 class="service-checkbox">
                                <label>
                                    <input 
                                        type="checkbox" 
                                        :value="service"
                                        v-model="reservationForm.selectedServices"
                                    >
                                    <span>{{ service }}</span>
                                </label>
                            </div>
                        </div>
                        <p class="service-validation" v-if="!reservationForm.selectedServices.length">
                            하나 이상의 서비스를 선택해주세요
                        </p>
                    </div>
                    <div class="form-group">
                        <label>요청사항</label>
                        <textarea 
                            v-model="reservationForm.description"
                            rows="3"
                            required
                        ></textarea>
                    </div>
                    <div class="price-section">
                        <div class="estimated-price">
                            예상 금액: {{ formatPrice(calculatePrice()) }}원
                        </div>
                        <div class="form-group custom-price">
                            <label>결제 금액</label>
                            <input 
                                type="number" 
                                v-model.number="reservationForm.price"
                                min="0"
                                required
                            >
                            <span class="price-unit">원</span>
                        </div>
                    </div>
                    <div class="modal-buttons">
                        <button type="button" @click="closeModal" class="cancel-button">
                            취소
                        </button>
                        <button 
                            type="submit" 
                            class="submit-button"
                            :disabled="!isFormValid || !reservationForm.selectedServices.length"
                        >
                            예약 신청
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import { useToast } from 'vue-toastification'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

interface Petsitter {
    id: number;
    name: string;
    introduction: string;
    location: string;
    price: number;
    rating: number;
    reviewCount: number;
    availableTime: string;
    services: string[];
    serviceAreas: string[];
}

const router = useRouter()
const toast = useToast()
const auth = useAuthStore()
const petsitters = ref<Petsitter[]>([])
const currentPage = ref(0)
const totalPages = ref(0)
const hasNext = ref(false)
const showModal = ref(false)
const selectedPetsitter = ref<Petsitter | null>(null)

const reservationForm = ref({
    startTime: '',
    endTime: '',
    description: '',
    price: 0,
    selectedServices: [] as string[]
})

// 펫시터 목록 조회
const fetchPetsitters = async (page: number) => {
    try {
        const response = await axios.get(`/petsitters?page=${page}&size=5`)
        petsitters.value = response.data.petsitters
        totalPages.value = response.data.totalPages
        hasNext.value = response.data.hasNext
        currentPage.value = page
    } catch (error) {
        console.error('펫시터 목록 조회 실패:', error)
        toast.error('펫시터 목록을 불러오는데 실패했습니다.')
    }
}

// 페이지 변경
const changePage = (page: number) => {
    fetchPetsitters(page)
}

// 예약 모달 열기
const openReservationModal = (petsitter: Petsitter) => {
    // 로그인 상태 체크
    if (!auth.isAuthenticated) {
        toast.warning('로그인이 필요한 서비스입니다.')
        router.push({
            path: '/login',
            query: { redirect: '/petsitter' }  // 로그인 후 돌아올 페이지 지정
        })
        return
    }

    selectedPetsitter.value = petsitter
    showModal.value = true
    // 기본 가격 설정
    reservationForm.value.price = calculatePrice()
}

// 예약 모달 닫기
const closeModal = () => {
    showModal.value = false
    selectedPetsitter.value = null
    reservationForm.value = {
        startTime: '',
        endTime: '',
        description: '',
        price: 0,
        selectedServices: []
    }
}

// 예상 금액 계산
const calculatePrice = () => {
    if (!selectedPetsitter.value || !reservationForm.value.startTime || !reservationForm.value.endTime) {
        return 0
    }

    const start = new Date(reservationForm.value.startTime)
    const end = new Date(reservationForm.value.endTime)
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
    return Math.max(0, Math.round(hours * selectedPetsitter.value.price))
}

// 시간 변경 시 예상 금액 업데이트
const updateEstimatedPrice = () => {
    reservationForm.value.price = calculatePrice()
}

// 예약 제출
const submitReservation = async () => {
    try {
        if (!selectedPetsitter.value) {
            toast.error('펫시터 정보를 찾을 수 없습니다.')
            return
        }

        if (!reservationForm.value.selectedServices.length) {
            toast.error('하나 이상의 서비스를 선택해주세요.')
            return
        }

        // 시작 시간이 현재보다 이전인지 확인
        const now = new Date()
        const startTime = new Date(reservationForm.value.startTime)
        if (startTime < now) {
            toast.error('시작 시간은 현재 시간 이후여야 합니다.')
            return
        }

        // 종료 시간이 시작 시간보다 이전인지 확인
        const endTime = new Date(reservationForm.value.endTime)
        if (endTime <= startTime) {
            toast.error('종료 시간은 시작 시간 이후여야 합니다.')
            return
        }

        const request = {
            petsitterId: selectedPetsitter.value.id,
            startTime: new Date(reservationForm.value.startTime).toISOString(),
            endTime: new Date(reservationForm.value.endTime).toISOString(),
            description: reservationForm.value.description,
            price: reservationForm.value.price,
            services: reservationForm.value.selectedServices
        }

        await axios.post('/reservations', request)
        toast.success('예약이 신청되었습니다. 펫시터의 승인을 기다려주세요.')
        closeModal()
    } catch (error: any) {
        console.error('예약 신청 실패:', error)
        toast.error(error.response?.data?.message || '예약 신청에 실패했습니다.')
    }
}

const formatPrice = (price: number) => {
    return price.toLocaleString()
}

// 최소 날짜 시간 계산 (현재 시간)
const minDateTime = computed(() => {
    const now = new Date()
    return now.toISOString().slice(0, 16) // YYYY-MM-DDTHH:mm 형식으로 변환
})

// 시작 시간 관련 함수
const resetStartTime = () => {
    reservationForm.value.startTime = ''
    updateEstimatedPrice()
}

const confirmStartTime = () => {
    if (reservationForm.value.startTime) {
        toast.success('시작 시간이 설정되었습니다.')
    }
}

// 종료 시간 관련 함수
const resetEndTime = () => {
    reservationForm.value.endTime = ''
    updateEstimatedPrice()
}

const confirmEndTime = () => {
    if (reservationForm.value.endTime) {
        if (new Date(reservationForm.value.endTime) <= new Date(reservationForm.value.startTime)) {
            toast.error('종료 시간은 시작 시간 이후여야 합니다.')
            reservationForm.value.endTime = ''
            return
        }
        toast.success('종료 시간이 설정되었습니다.')
    }
}

const isFormValid = computed(() => {
    return reservationForm.value.startTime && 
           reservationForm.value.endTime && 
           reservationForm.value.selectedServices.length > 0;  // 서비스 선택 검증 추가
});

onMounted(() => {
    fetchPetsitters(0)
})
</script>

<style scoped>
.petsitter-view {
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
}

.petsitter-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(450px, 1fr));
    gap: 2rem;
    margin: 2rem 0;
}

.petsitter-card {
    background: white;
    border-radius: 12px;
    padding: 1.8rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: 300px;
    transition: transform 0.2s, box-shadow 0.2s;
}

.petsitter-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.petsitter-info {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 1.5rem;
}

.petsitter-info-left {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
}

.petsitter-info-right {
    text-align: right;
}

.petsitter-info h3 {
    margin: 0;
    font-size: 1.4rem;
    color: #1a1a1a;
}

.rating {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.8rem;
}

.stars {
    color: #ffd700;
    font-size: 1.1rem;
}

.location {
    color: #4a5568;
    font-size: 1rem;
    margin-bottom: 0.8rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.available-time, .services, .service-areas {
    margin-bottom: 0.8rem;
    font-size: 0.95rem;
    color: #4a5568;
}

.info-label {
    font-weight: 600;
    color: #2d3748;
    margin-right: 0.5rem;
    display: inline-block;
    min-width: 90px;
}

.service-tag, .area-tag {
    display: inline-block;
    background: #edf2ff;
    color: #4263eb;
    padding: 0.3rem 0.8rem;
    border-radius: 20px;
    margin: 0.2rem;
    font-size: 0.9rem;
    font-weight: 500;
}

.introduction {
    color: #4a5568;
    margin: 1rem 0;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    line-height: 1.5;
}

.price {
    font-size: 1.2rem;
    font-weight: 600;
    color: #4263eb;
    margin: 1rem 0;
}

.reserve-button {
    background: #4263eb;
    color: white;
    border: none;
    padding: 0.9rem;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    font-weight: 500;
    font-size: 1rem;
    width: 100%;
    margin-top: 1rem;
}

.reserve-button:hover {
    background: #3b5bdb;
}

.pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    margin-top: 2rem;
}

.page-button {
    padding: 0.5rem 1rem;
    border: 1px solid #dee2e6;
    border-radius: 4px;
    background: white;
    cursor: pointer;
}

.page-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-content {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    width: 90%;
    max-width: 500px;
}

.form-group {
    margin-bottom: 1rem;
}

.form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
}

.form-group input,
.form-group textarea {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #dee2e6;
    border-radius: 4px;
}

.price-section {
    margin: 1rem 0;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 4px;
}

.custom-price {
    margin-top: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.custom-price input {
    width: 150px;
    text-align: right;
}

.price-unit {
    color: #495057;
}

.estimated-price {
    color: #6c757d;
    font-size: 0.9rem;
}

.modal-buttons {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 1.5rem;
}

.cancel-button {
    padding: 0.5rem 1rem;
    border: 1px solid #dee2e6;
    border-radius: 4px;
    background: white;
}

.submit-button {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    background: #4263eb;
    color: white;
    cursor: pointer;
}

.submit-button:hover {
    background: #3b5bdb;
}

.datetime-picker {
    position: relative;
}

.datetime-buttons {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.5rem;
}

.datetime-button {
    flex: 1;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    border: 1px solid #dee2e6;
    cursor: pointer;
    font-size: 0.9rem;
    transition: all 0.2s;
}

.datetime-button.cancel {
    background: white;
    color: #495057;
}

.datetime-button.confirm {
    background: #4263eb;
    color: white;
    border-color: #4263eb;
}

.datetime-button.cancel:hover {
    background: #f8f9fa;
}

.datetime-button.confirm:hover {
    background: #3b5bdb;
}

/* input 스타일 수정 */
.datetime-picker input[type="datetime-local"] {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #dee2e6;
    border-radius: 4px;
    font-size: 1rem;
}

.service-selection {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 0.8rem;
    margin-top: 0.5rem;
}

.service-checkbox {
    display: flex;
    align-items: center;
}

.service-checkbox label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 4px;
    background: #f8f9fa;
    transition: all 0.2s;
}

.service-checkbox label:hover {
    background: #e9ecef;
}

.service-checkbox input[type="checkbox"] {
    width: auto;
    margin: 0;
}

.service-validation {
    color: #dc3545;
    font-size: 0.9rem;
    margin-top: 0.5rem;
}
</style> 