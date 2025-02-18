<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useToast } from 'vue-toastification'
import { useRouter } from 'vue-router'
import { onPayment } from '@/payment/PaymentTest';
import { useAuthStore } from '@/stores/auth';

// Reservation 인터페이스 추가
interface Reservation {
    id: number;
    userName: string;
    status: string;
    description: string;
    price: number;
    requestedAt: string;
    startTime: string;
    endTime: string;
    selectedServices: string[];  // 선택된 서비스 배열 추가
}

const router = useRouter()
const toast = useToast()
const auth = useAuthStore()
// reservations의 타입을 Reservation[] 으로 지정
const reservations = ref<Reservation[]>([])

const fetchReservations = async () => {
    try {
        const response = await axios.get('/reservations/my')
        reservations.value = response.data
    } catch (error) {
        console.error('예약 내역 조회 실패:', error)
        toast.error('예약 내역을 불러오는데 실패했습니다.')
    }
}

const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    })
}

const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ko-KR')
}

const formatPrice = (price: number) => {
    return price.toLocaleString()
}

const getStatusClass = (status: string) => {
    const statusMap: { [key: string]: string } = {
        '대기중': 'pending',
        '승인중': 'confirming',
        '결제중': 'perchasing',
        '확정됨': 'confirmed',
        '취소됨': 'cancelled'
    }
    return statusMap[status] || 'pending'
}

const handlePayment = async (reservationId: string, amount: number) => {
    const success = await onPayment(
        reservationId,
        amount,
        '펫시터 예약',
        auth.user?.name || '',
        auth.user?.email || ''
    );

    if (success) {
        // 결제 성공 시 예약 목록 갱신
        await fetchReservations();
    }
};

onMounted(fetchReservations)
</script>

<template>
    <div class="reservation-history">
        <h2>예약 내역</h2>
        <div class="reservation-list">
            <div v-for="reservation in reservations" 
                 :key="reservation.id" 
                 class="reservation-item">
                <div class="reservation-info">
                    <div class="reservation-header">
                        <span class="petsitter-name">{{ reservation.userName }}</span>
                        <span :class="['status-badge', getStatusClass(reservation.status)]">
                            {{ reservation.status }}
                        </span>
                    </div>
                    <div class="reservation-details">
                        <p class="description">{{ reservation.description }}</p>
                        <p class="time">
                            {{ formatDateTime(reservation.startTime) }} ~ {{ formatDateTime(reservation.endTime) }}
                        </p>
                        <div class="selected-services">
                            <p class="services-title">요청 서비스:</p>
                            <div class="service-tags">
                                <span v-for="service in reservation.selectedServices" 
                                      :key="service" 
                                      class="service-tag">
                                    {{ service }}
                                </span>
                            </div>
                        </div>
                        <p class="price">{{ formatPrice(reservation.price) }}원</p>
                        
                        <!-- 결제 버튼 추가 -->
                        <div v-if="reservation.status === '결제중'" class="payment-action">
                            <button 
                                class="payment-button"
                                @click="handlePayment(reservation.id.toString(), reservation.price)"
                            >
                                결제하기
                            </button>
                        </div>
                    </div>
                    <div class="reservation-footer">
                        <span class="requested-at">신청일: {{ formatDate(reservation.requestedAt) }}</span>
                    </div>
                </div>
            </div>
            <div v-if="reservations.length === 0" class="no-reservations">
                예약 내역이 없습니다.
            </div>
        </div>
    </div>
</template>

<style scoped>
.reservation-history {
    padding: 20px;
}

.reservation-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.reservation-item {
    background: white;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    padding: 1.5rem;
}

.reservation-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.petsitter-name {
    font-weight: 600;
    font-size: 1.1rem;
}

.status-badge {
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-size: 0.9rem;
}

.pending { background: #fff3cd; color: #856404; }
.confirming { background: #cce5ff; color: #004085; }
.perchasing { background: #d4edda; color: #155724; }
.confirmed { background: #d1ecf1; color: #0c5460; }
.cancelled { background: #f8d7da; color: #721c24; }

.reservation-details {
    margin: 1rem 0;
}

.description {
    margin-bottom: 0.5rem;
}

.time {
    color: #666;
    font-size: 0.9rem;
}

.price {
    font-weight: 600;
    color: #4263eb;
    margin-top: 0.5rem;
}

.reservation-footer {
    border-top: 1px solid #e9ecef;
    padding-top: 1rem;
    margin-top: 1rem;
}

.requested-at {
    color: #666;
    font-size: 0.9rem;
}

.no-reservations {
    text-align: center;
    padding: 2rem;
    color: #666;
    background: #f8f9fa;
    border-radius: 8px;
}

.payment-action {
    margin-top: 1rem;
    text-align: right;
}

.payment-button {
    background-color: #4263EB;
    color: white;
    border: none;
    padding: 0.5rem 1.5rem;
    border-radius: 4px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
}

.payment-button:hover {
    background-color: #3b5bdb;
    transform: translateY(-1px);
}

.selected-services {
    margin: 1rem 0;
}

.services-title {
    font-weight: 500;
    color: #4a5568;
    margin-bottom: 0.5rem;
}

.service-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.service-tag {
    background: #e3eeff;
    color: #4263eb;
    padding: 0.3rem 0.8rem;
    border-radius: 15px;
    font-size: 0.9rem;
    font-weight: 500;
}
</style> 