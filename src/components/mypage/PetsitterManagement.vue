<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useToast } from 'vue-toastification';
import type { CodeGroup } from '@/types/code';
const toast = useToast();

// 인터페이스 정의
interface PetsitterInfo {
    id: number;
    introduction: string;
    experience: string;
    availableTime: string;
    location: string;
    price: number;
    isApproved: boolean;
    services: string[];
    totalServices: number;
    totalReviews: number;
    rating: number;
    codeGroups: CodeGroup[];
    codeGroupIds: string[];
}

interface Review {
    id: number;
    rating: number;
    petName: string;
    ownerName: string;
    date: string;
    comment: string;
}

// 상태 변수들의 타입 지정
const petsitterInfo = ref<PetsitterInfo | null>(null);
const reviews = ref<Review[]>([]);
const isPetsitter = ref<boolean>(false);  // null 대신 boolean 사용
const isEditing = ref<boolean>(false);
const isApplying = ref<boolean>(false);
const newService = ref('');  // 승인 상태로 변경

// 편집 폼 데이터
const editForm = ref({
    introduction: '',
    experience: '',
    availableTime: '',
    location: '',
    price: 0,
    services: [],
    documents: null as File | null,
    experienceChanged: false,  // 자격/경력 변경 여부 추적
    codeGroupIds: [] as string[]  // 추가
});

// 자격/경력 변경 감지
const handleExperienceChange = (event: Event) => {
    const target = event.target as HTMLTextAreaElement;
    editForm.value.experienceChanged = target.value !== '';
};

// 수정 시작
const startEditing = () => {
    isEditing.value = true;
    editForm.value = {
        introduction: petsitterInfo.value?.introduction || '',
        experience: petsitterInfo.value?.experience || '',
        availableTime: petsitterInfo.value?.availableTime || '',
        location: petsitterInfo.value?.location || '',
        price: petsitterInfo.value?.price || 0,
        services: petsitterInfo.value?.services ? [...petsitterInfo.value.services] : [],
        documents: null,
        experienceChanged: false,
        codeGroupIds: petsitterInfo.value?.codeGroupIds || []  // 추가
    };
};

// 수정 취소
const cancelEditing = () => {
    isEditing.value = false;
};

// 수정 저장
const saveChanges = async () => {
    try {
        if (editForm.value.experienceChanged && !editForm.value.documents) {
            alert('자격 및 경력사항이 변경되었습니다. 증빙서류를 첨부해주세요.');
            return;
        }

        const requestData = {
            introduction: editForm.value.introduction,
            experience: editForm.value.experience,
            availableTime: editForm.value.availableTime,
            location: editForm.value.location,
            price: editForm.value.price,
            services: editForm.value.services || [],  // 빈 배열 기본값 설정
            certifications: editForm.value.documents ? [editForm.value.documents] : [],  // 빈 배열 기본값 설정
            codeGroupIds: editForm.value.codeGroupIds || []  // 빈 배열 기본값 설정
        };

        const response = await axios.post('/petsitters/info', requestData);
        if (response.data) {
            petsitterInfo.value = response.data;
            toast.success('정보가 수정되었습니다.');
            isEditing.value = false;
        }
    } catch (error) {
        console.error('정보 수정 실패:', error);
        toast.error('정보 수정에 실패했습니다.');
    }
};

// 서비스 추가 메서드
const addService = () => {
    const service = newService.value.trim();
    if (service) {
        if (isEditing.value && !editForm.value.services.includes(service)) {
            editForm.value.services.push(service);
        } else if (!applicationForm.value.services.includes(service)) {
            applicationForm.value.services.push(service);
        }
        newService.value = '';
    }
};

// 서비스 제거 메서드
const removeService = (serviceToRemove: string) => {
    if (isEditing.value) {
        editForm.value.services = editForm.value.services.filter(
            service => service !== serviceToRemove
        );
    } else {
        applicationForm.value.services = applicationForm.value.services.filter(
            service => service !== serviceToRemove
        );
    }
};

// 신청 폼 데이터
const applicationForm = ref({
    introduction: '',
    availableTime: '',
    experience: '',
    price: 0,
    location: '',
    services: [],
    documents: null as File | null,
    codeGroupIds: [] as string[]  // 추가
});

// 파일 선택 처리
const handleFileChange = (event: Event) => {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
        editForm.value.documents = input.files[0];
    } else {
        editForm.value.documents = null;
    }
};

// 신청 폼 표시
const handleApply = () => {
    isApplying.value = true;
};

// 펫시터 정보 가져오기
const fetchPetsitterInfo = async () => {
    try {
        const response = await axios.get('/petsitters/info', { withCredentials: true });
        petsitterInfo.value = response.data;
        isPetsitter.value = true;
    } catch (error) {
        console.error('펫시터 정보 가져오기 실패:', error);
        isPetsitter.value = false;
    }
};

// 컴포넌트가 마운트될 때 펫시터 정보 가져오기
onMounted(() => {
    fetchPetsitterInfo();
});

// 신청 제출
const submitApplication = async () => {
    try {
        const response = await axios.post('/petsitters/register', {
            introduction: applicationForm.value.introduction,
            availableTime: applicationForm.value.availableTime,
            experience: applicationForm.value.experience,
            price: applicationForm.value.price,
            location: applicationForm.value.location,
            services: applicationForm.value.services,
            certifications: applicationForm.value.documents,
            codeGroupIds: applicationForm.value.codeGroupIds  // 추가
        }, { withCredentials: true });
        alert('펫시터 신청이 완료되었습니다. 관리자 승인 후 활동이 가능합니다.');
        isPetsitter.value = true; // 신청 완료 상태로 전환
        fetchPetsitterInfo(); // 탭 재 마운트
    } catch (error) {
        console.error('신청 실패:', error);
        alert('신청 처리 중 오류가 발생했습니다.');
    }
};

// 코드 그룹 관련 상태 추가
const codeGroups = ref<CodeGroup[]>([]);
const selectedCodeGroups = ref<string[]>([]);

// 코드 그룹 목록 조회
const fetchCodeGroups = async () => {
    try {
        const response = await axios.get('/codes/groups');
        codeGroups.value = response.data;
    } catch (error) {
        console.error('Error fetching code groups:', error);
        toast.error('코드 그룹 목록을 불러오는데 실패했습니다.');
    }
};

// 현재 펫시터 정보 조회 함수 수정
const fetchCurrentPetsitter = async () => {
    try {
        const response = await axios.get('/petsitters/info');
        if (response.data) {
            const data = response.data;
            petsitterInfo.value = data;
            isPetsitter.value = true;
            selectedCodeGroups.value = data.codeGroupIds || [];
        }
    } catch (error) {
        console.error('Error fetching petsitter info:', error);
        isPetsitter.value = false;
    }
};

// 펫시터 등록/수정 함수 수정
const handleSubmit = async () => {
    if (!petsitterInfo.value) return;  // null 체크 추가

    const requestData = {
        introduction: petsitterInfo.value.introduction,
        experience: petsitterInfo.value.experience,
        availableTime: petsitterInfo.value.availableTime,
        location: petsitterInfo.value.location,
        price: petsitterInfo.value.price,
        services: petsitterInfo.value.services,
        codeGroupIds: selectedCodeGroups.value
    };

    try {
        const endpoint = isPetsitter.value ? '/petsitters/info' : '/petsitters/register';
        const response = await axios.post(endpoint, requestData);
        
        if (response.data) {
            toast.success(isPetsitter.value ? '펫시터 정보가 수정되었습니다.' : '펫시터 등록이 완료되었습니다.');
            isPetsitter.value = true;
            await fetchCurrentPetsitter();
        }
    } catch (error) {
        console.error('Error submitting petsitter info:', error);
        toast.error('펫시터 정보 저장에 실패했습니다.');
    }
};

onMounted(async () => {
    await Promise.all([
        fetchCurrentPetsitter(),
        fetchCodeGroups()
    ]);
});

// 예약 내역 상태 추가
interface Reservation {
    id: number;
    userName: string;
    status: string;
    description: string;
    price: number;
    requestedAt: string;
    startTime: string;
    endTime: string;
    selectedServices: string[];
}

const reservations = ref<Reservation[]>([]);

// 예약 내역 조회 함수
const fetchReservations = async () => {
    try {
        const response = await axios.get('/petsitters/reservations', { withCredentials: true });
        reservations.value = response.data;
    } catch (error) {
        console.error('예약 내역 조회 실패:', error);
        toast.error('예약 내역을 불러오는데 실패했습니다.');
    }
};

// 날짜/시간 포맷팅 함수
const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ko-KR');
};

const formatPrice = (price: number) => {
    return price.toLocaleString();
};

const getStatusClass = (status: string) => {
    const statusMap: { [key: string]: string } = {
        '승인중': 'confirming',
        '결제중': 'perchasing',
        '확정됨': 'confirmed',
        '취소됨': 'cancelled'
    };
    return statusMap[status] || 'confirming';
};

// 컴포넌트 마운트 시 예약 내역 조회
onMounted(async () => {
    await fetchPetsitterInfo();
    if (isPetsitter.value) {
        await fetchReservations();
    }
});

// 예약 승인 함수 추가
const approveReservation = async (reservationId: number) => {
    try {
        await axios.post(`/reservations/${reservationId}/approve`, null, { 
            withCredentials: true 
        });
        toast.success('예약이 승인되었습니다.');
        await fetchReservations();  // 예약 목록 새로고침
    } catch (error) {
        console.error('예약 승인 실패:', error);
        toast.error('예약 승인에 실패했습니다.');
    }
};
</script>

<template>
    <div class="petsitter-management">
        <!-- 신청하기 화면 - isApplying이 false일 때만 표시 -->
        <div v-if="!isPetsitter && !isApplying" class="petsitter-apply">
            <div class="apply-content">
                <h2>펫시터가 되어보세요!</h2>
                <div class="benefits">
                    <h3>펫시터가 되면</h3>
                    <ul>
                        <li>
                            <span class="benefit-icon">💰</span>
                            <div class="benefit-text">
                                <strong>자유로운 수입 창출</strong>
                                <p>원하는 시간에 일하고 수입을 만들어보세요</p>
                            </div>
                        </li>
                        <li>
                            <span class="benefit-icon">🐕</span>
                            <div class="benefit-text">
                                <strong>반려동물과 함께하는 즐거움</strong>
                                <p>다양한 반려동물들과 특별한 경험을 만들어보세요</p>
                            </div>
                        </li>
                        <li>
                            <span class="benefit-icon">📱</span>
                            <div class="benefit-text">
                                <strong>편리한 일정 관리</strong>
                                <p>앱을 통해 손쉽게 예약과 일정을 관리하세요</p>
                            </div>
                        </li>
                    </ul>
                </div>
                <button class="apply-button" @click="handleApply">
                    펫시터 신청하기
                </button>
            </div>
        </div>

        <!-- 신청 폼 -->
        <div v-if="!isPetsitter && isApplying" class="application-form">
            <h2>펫시터 신청</h2>
            <div class="form-content">
                <div class="form-group">
                    <label>소개글</label>
                    <textarea 
                        v-model="applicationForm.introduction"
                        rows="4"
                        placeholder="반려동물을 향한 당신의 열정을 소개해주세요"
                        class="form-input"
                    ></textarea>
                </div>

                <div class="form-group">
                    <label>활동 가능 시간</label>
                    <input 
                        type="text"
                        v-model="applicationForm.availableTime"
                        placeholder="예: 평일 오전 9시 ~ 오후 6시"
                        class="form-input"
                    >
                </div>

                <div class="form-group">
                    <label>자격 및 경력</label>
                    <textarea 
                        v-model="applicationForm.experience"
                        rows="4"
                        placeholder="관련 자격증이나 경력을 작성해주세요"
                        class="form-input"
                    ></textarea>
                </div>

                <div class="form-group">
                    <label>시간당 요금 (원)</label>
                    <input 
                        type="number"
                        v-model="applicationForm.price"
                        placeholder="시간당 요금을 입력해주세요"
                        class="form-input"
                    >
                </div>

                <div class="form-group">
                    <label>활동 지역</label>
                    <input 
                        type="text"
                        v-model="applicationForm.location"
                        placeholder="예: 서울시 강남구"
                        class="form-input"
                    >
                </div>

                <div class="form-group">
                    <label>제공 서비스</label>
                    <div class="service-tags editable">
                        <div class="service-input-group">
                            <input 
                                type="text"
                                v-model="newService"
                                placeholder="제공할 서비스를 입력해주세요"
                                class="form-input"
                                @keyup.enter="addService"
                            >
                            <button 
                                class="add-service-button"
                                @click="addService"
                                :disabled="!newService.trim()"
                            >
                                추가
                            </button>
                        </div>
                        <div class="service-tag-list">
                            <span 
                                v-for="service in applicationForm.services" 
                                :key="service" 
                                class="service-tag"
                            >
                                {{ service }}
                                <button 
                                    class="remove-service"
                                    @click="removeService(service)"
                                >
                                    ×
                                </button>
                            </span>
                        </div>
                    </div>
                </div>

                <div class="form-group">
                    <label>증빙 서류</label>
                    <div class="file-upload-wrapper">
                        <input 
                            type="file"
                            id="file-upload"
                            @change="handleFileChange"
                            accept=".zip,.rar,.7zip"
                            class="file-input"
                        >
                        <label for="file-upload" class="file-upload-button">
                            파일 선택
                        </label>
                        <span class="file-name">
                            {{ applicationForm.documents ? applicationForm.documents.name : '선택된 파일 없음' }}
                        </span>
                    </div>
                    <p class="input-help">자격증 및 경력 증명서를 압축파일로 제출해주세요.</p>
                </div>

                <div class="form-group">
                    <label>코드 그룹 선택</label>
                    <div class="code-groups-grid">
                        <div v-for="group in codeGroups" 
                             :key="group.group_id" 
                             class="code-group-item">
                            <label class="checkbox-label">
                                <input type="checkbox" 
                                       v-model="applicationForm.codeGroupIds" 
                                       :value="group.group_id">
                                {{ group.group_name }}
                            </label>
                            <span class="description">{{ group.description }}</span>
                        </div>
                    </div>
                </div>

                <div class="button-group">
                    <button class="submit-button" @click="submitApplication">신청하기</button>
                    <button class="cancel-button" @click="isApplying = false">취소</button>
                </div>
            </div>
        </div>

        <!-- 펫시터 대시보드 -->
        <div v-if="petsitterInfo" class="petsitter-dashboard">
            <!-- 상태 요약 -->
            <div class="status-cards">
                <div class="status-card">
                    <h3>평점</h3>
                    <div class="status-value">
                        {{ petsitterInfo.rating === 0 ? '-' : `${petsitterInfo.rating}점` }}
                    </div>
                    <div class="status-sub">
                        총 {{ petsitterInfo.totalReviews === 0 ? '-' : petsitterInfo.totalReviews }}개의 리뷰
                    </div>
                </div>
                <div class="status-card">
                    <h3>총 서비스</h3>
                    <div class="status-value">
                        {{ petsitterInfo.totalServices === 0 ? '-' : `${petsitterInfo.totalServices}건` }}
                    </div>
                    <div class="status-sub">
                        이번 달 {{ petsitterInfo.totalServices === 0 ? '-' : '8' }}건
                    </div>
                </div>
            </div>

            <!-- 펫시터 정보 -->
            <div class="section info-section">
                <div class="section-header">
                    <h2>펫시터 정보</h2>
                    <div class="edit-button-wrapper">
                        <button v-if="!isEditing" 
                                class="edit-button"
                                :class="{ 'disabled': !petsitterInfo.isApproved }"
                                :disabled="!petsitterInfo.isApproved"
                                @click="startEditing">
                            수정
                        </button>
                        <div v-if="!petsitterInfo.isApproved" class="tooltip">
                            펫시터 승인 대기 상태여서 정보 수정을 할 수 없습니다!
                        </div>
                    </div>
                </div>
                
                <!-- 수정 모드 -->
                <div v-if="isEditing" class="edit-form">
                    <div class="info-content">
                        <div class="info-row">
                            <div class="info-item">
                                <h3>소개</h3>
                                <textarea 
                                    v-model="editForm.introduction"
                                    rows="4"
                                    class="form-input"
                                ></textarea>
                            </div>
                            <div class="info-item">
                                <div class="label-group">
                                    <h3>자격 및 경력</h3>
                                </div>
                                <span class="warning-text">* 변경 시 증빙서류 제출 및 관리자 승인이 필요합니다</span>
                                <textarea 
                                    v-model="editForm.experience"
                                    rows="4"
                                    class="form-input"
                                    @input="handleExperienceChange"
                                ></textarea>
                                <div v-if="editForm.experienceChanged" class="document-upload">
                                    <div class="file-upload-wrapper">
                                        <input 
                                            type="file"
                                            id="edit-file-upload"
                                            @change="handleFileChange"
                                            accept=".zip,.rar,.7zip"
                                            class="file-input"
                                        >
                                        <label for="edit-file-upload" class="file-upload-button">
                                            증빙서류 선택
                                        </label>
                                        <span class="file-name">
                                            {{ editForm.documents ? editForm.documents.name : '선택된 파일 없음' }}
                                        </span>
                                    </div>
                                    <p class="input-help">자격증 및 경력 증명서를 압축파일로 제출해주세요.</p>
                                </div>
                            </div>
                        </div>
                        <div class="info-row">
                            <div class="info-item">
                                <h3>활동 가능 시간</h3>
                                <input 
                                    type="text"
                                    v-model="editForm.availableTime"
                                    class="form-input"
                                >
                            </div>
                            <div class="info-item">
                                <h3>활동 지역</h3>
                                <input 
                                    type="text"
                                    v-model="editForm.location"
                                    class="form-input"
                                >
                            </div>
                        </div>
                        <div class="info-row">
                            <div class="info-item">
                                <h3>시간당 요금</h3>
                                <input 
                                    type="number"
                                    v-model="editForm.price"
                                    class="form-input"
                                >
                            </div>
                            <div class="info-item">
                                <h3>제공 서비스</h3>
                                <div class="service-tags editable">
                                    <div class="service-input-group">
                                        <input 
                                            type="text"
                                            v-model="newService"
                                            placeholder="서비스 입력"
                                            class="form-input"
                                            @keyup.enter="addService"
                                        >
                                        <button 
                                            class="add-service-button"
                                            @click="addService"
                                            :disabled="!newService.trim()"
                                        >
                                            추가
                                        </button>
                                    </div>
                                    <div class="service-tag-list">
                                        <span 
                                            v-for="service in editForm.services" 
                                            :key="service" 
                                            class="service-tag"
                                        >
                                            {{ service }}
                                            <button 
                                                class="remove-service"
                                                @click="removeService(service)"
                                                title="서비스 제거"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="info-row">
                            <div class="info-item full-width">
                                <h3>코드 그룹 선택</h3>
                                <div class="code-groups-grid">
                                    <div v-for="group in codeGroups" 
                                         :key="group.group_id" 
                                         class="code-group-item">
                                        <label class="checkbox-label">
                                            <input type="checkbox" 
                                                   v-model="editForm.codeGroupIds" 
                                                   :value="group.group_id">
                                            {{ group.group_name }}
                                        </label>
                                        <span class="description">{{ group.description }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="button-group">
                        <button class="save-button" @click="saveChanges">저장</button>
                        <button class="cancel-button" @click="cancelEditing">취소</button>
                    </div>
                </div>

                <!-- 조회 모드 -->
                <div v-else class="info-content">
                    <div class="info-row">
                        <div class="info-item">
                            <h3>소개</h3>
                            <p>{{ petsitterInfo.introduction }}</p>
                        </div>
                        <div class="info-item">
                            <h3>자격 및 경력</h3>
                            <p style="white-space: pre-line">{{ petsitterInfo.experience }}</p>
                        </div>
                    </div>
                    <div class="info-row">
                        <div class="info-item">
                            <h3>활동 가능 시간</h3>
                            <p>{{ petsitterInfo.availableTime }}</p>
                        </div>
                        <div class="info-item">
                            <h3>활동 지역</h3>
                            <p>{{ petsitterInfo.location }}</p>
                        </div>
                    </div>
                    <div class="info-row">
                        <div class="info-item">
                            <h3>시간당 요금</h3>
                            <p>{{ petsitterInfo.price.toLocaleString() }}원</p>
                        </div>
                        <div class="info-item">
                            <h3>제공 서비스</h3>
                            <div class="service-tags">
                                <span v-for="service in petsitterInfo.services" 
                                      :key="service" 
                                      class="service-tag">
                                    {{ service }}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="info-row">
                        <div class="info-item full-width">
                            <h3>코드 그룹</h3>
                            <div class="code-groups-display">
                                <div v-for="group in petsitterInfo.codeGroups" 
                                     :key="group.group_id" 
                                     class="code-group-tag">
                                    <span class="group-name">{{ group.group_name }}</span>
                                    <span class="group-description">{{ group.description }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 예약 현황 -->
            <div class="section">
                <h2>예약 현황</h2>
                <div class="reservation-list">
                    <div v-for="reservation in reservations" 
                         :key="reservation.id" 
                         class="reservation-item">
                        <div class="reservation-info">
                            <div class="reservation-header">
                                <span class="client-name">{{ reservation.userName }}</span>
                                <span 
                                    :class="['status-badge', getStatusClass(reservation.status)]"
                                    @click="reservation.status === '승인중' ? approveReservation(reservation.id) : null"
                                    :style="reservation.status === '승인중' ? 'cursor: pointer' : ''"
                                >
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

            <!-- 리뷰 -->
            <div class="section">
                <h2>리뷰</h2>
                <div class="review-list">
                    <div v-for="review in reviews" 
                         :key="review.id" 
                         class="review-item"
                    >
                        <div class="review-header">
                            <div class="review-rating">
                                ★ {{ review.rating }}
                            </div>
                            <div class="review-info">
                                {{ review.petName }} ({{ review.ownerName }})
                            </div>
                            <div class="review-date">
                                {{ review.date }}
                            </div>
                        </div>
                        <p class="review-comment">{{ review.comment }}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.status-cards {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.status-card {
    background: #f8f9fa;
    padding: 1.5rem;
    border-radius: 12px;
    text-align: center;
}

.status-card h3 {
        color: #666;
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
}

.status-value {
    color: #4263EB;
    font-size: 1.8rem;
    font-weight: bold;
    margin-bottom: 0.25rem;
}

.status-sub {
    color: #666;
    font-size: 0.9rem;
}

.section {
    background: white;
    border-radius: 12px;
    padding: 2rem;
    margin-bottom: 2rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.section h2 {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 1.5rem;
    color: #333;
}

.reservation-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-top: 1rem;
}

.reservation-item {
    background: white;
    border: 1px solid #eaeaea;
    border-radius: 8px;
    padding: 1.5rem;
    transition: all 0.2s ease;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.reservation-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.reservation-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.client-name {
    font-weight: 600;
    font-size: 1.1rem;
    color: #333;
}

.status-badge {
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: 500;
    transition: all 0.2s ease;
}

.confirming { background: #e3f2fd; color: #1976d2; }
.perchasing { background: #e8f5e9; color: #2e7d32; }
.confirmed { background: #e0f7fa; color: #00838f; }
.cancelled { background: #ffebee; color: #c62828; }

.reservation-details {
    margin: 1rem 0;
    line-height: 1.6;
}

.description {
    margin-bottom: 0.5rem;
    color: #555;
    font-size: 1rem;
}

.time {
    color: #666;
    font-size: 0.9rem;
    margin: 0.5rem 0;
}

.price {
    font-weight: 600;
    color: #4263eb;
    margin-top: 0.5rem;
    font-size: 1.1rem;
}

.reservation-footer {
    border-top: 1px solid #eee;
    padding-top: 1rem;
    margin-top: 1rem;
}

.requested-at {
    color: #666;
    font-size: 0.9rem;
    display: inline-block;
}

.no-reservations {
    text-align: center;
    padding: 2rem;
    color: #666;
    background: #f9fafb;
    border-radius: 8px;
    font-size: 1rem;
    border: 1px dashed #ddd;
}

.review-item {
    padding: 1rem;
    border: 1px solid #eee;
    border-radius: 8px;
    margin-bottom: 1rem;
}

.review-header {
    display: flex;
    align-items: center;
    margin-bottom: 0.5rem;
}

.review-rating {
    color: #ffc107;
    margin-right: 1rem;
}

.review-info {
    flex: 1;
}

.review-date {
    color: #666;
    font-size: 0.9rem;
}

.review-comment {
    color: #444;
    line-height: 1.5;
}

.info-section {
    background: white;
    padding: 1.5rem;
    border-radius: 12px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.info-content {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.info-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
}

.info-item {
    flex: 1;
}

.info-item h3 {
    color: #333;
    font-weight: 500;
    margin-bottom: 0.5rem;
}

.info-item p {
    color: #444;
    line-height: 1.5;
}

.service-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.service-tag {
    display: inline-flex;
    align-items: center;
    background: #e6f3ff;
    color: #0066cc;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-size: 0.9rem;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #eee;
}

.edit-button {
    padding: 0.5rem 1rem;
    background: white;
    border: 1px solid #4263EB;
    color: #4263EB;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.edit-button:hover {
    background: #4263EB;
    color: white;
}

.form-input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 0.9rem;
    color: #333;
}

textarea.form-input {
    resize: vertical;
    min-height: 100px;
    color: #333;
}

.button-group {
    display: flex;
    gap: 1rem;
    margin-top: 1.5rem;
}

.save-button, .cancel-button {
    padding: 0.75rem 1.5rem;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s ease;
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

.service-input-group {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
    width: 100%;
}

.service-input-group .form-input {
    flex: 1;
}

.add-service-button {
    padding: 0.75rem 1.5rem;
    background: #4263EB;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s ease;
    white-space: nowrap;
}

.add-service-button:hover {
    background: #3b5bdb;
}

.add-service-button:disabled {
    background: #e9ecef;
    cursor: not-allowed;
}

.service-tag-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.service-tags.editable {
    display: flex;
    flex-direction: column;
    padding: 1rem;
    border: 1px solid #ddd;
    border-radius: 4px;
}

.service-tag {
    display: inline-flex;
    align-items: center;
    background: #e6f3ff;
    color: #0066cc;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-size: 0.9rem;
}

.remove-service {
    margin-left: 0.5rem;
    color: #dc3545;
    border: none;
    background: none;
    cursor: pointer;
    padding: 0 0.25rem;
    font-size: 1.2rem;
    line-height: 1;
}

.remove-service:hover {
    color: #c82333;
}

@media (max-width: 768px) {
    .info-row {
        grid-template-columns: 1fr;
    }
}

.petsitter-apply {
    background: white;
    border-radius: 12px;
    padding: 2rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.apply-content {
    max-width: 600px;
    margin: 0 auto;
    text-align: center;
}

.apply-content h2 {
    font-size: 1.8rem;
    color: #333;
    margin-bottom: 2rem;
}

.benefits {
    margin: 2rem 0;
    text-align: left;
}

.benefits h3 {
    font-size: 1.2rem;
    color: #666;
    margin-bottom: 1.5rem;
    text-align: center;
}

.benefits ul {
    list-style: none;
    padding: 0;
}

.benefits li {
    display: flex;
    align-items: flex-start;
    margin-bottom: 1.5rem;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 8px;
}

.benefit-icon {
    font-size: 2rem;
    margin-right: 1rem;
}

.benefit-text {
    flex: 1;
}

.benefit-text strong {
    display: block;
    font-size: 1.1rem;
    color: #333;
    margin-bottom: 0.5rem;
}

.benefit-text p {
    color: #666;
    margin: 0;
    line-height: 1.4;
}

.apply-button {
    background: #4263EB;
    color: white;
    border: none;
    padding: 1rem 2rem;
    border-radius: 8px;
    font-size: 1.1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
}

.apply-button:hover {
    background: #3b5bdb;
    transform: translateY(-2px);
}

.edit-button-wrapper {
    position: relative;
}

.edit-button.disabled {
    background: #e9ecef;
    border-color: #ced4da;
    color: #6c757d;
    cursor: not-allowed;
}

.edit-button.disabled:hover {
    background: #e9ecef;
    color: #6c757d;
}

.tooltip {
    display: none;
    position: absolute;
    bottom: calc(100% + 10px);
    right: 0;
    background: #333;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    font-size: 0.9rem;
    white-space: nowrap;
    z-index: 1000;
}

.tooltip::after {
    content: '';
    position: absolute;
    top: 100%;
    right: 15px;
    border-width: 5px;
    border-style: solid;
    border-color: #333 transparent transparent transparent;
}

.edit-button-wrapper:hover .tooltip {
    display: block;
}

.application-form {
    background: white;
    border-radius: 12px;
    padding: 2rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    margin-bottom: 2rem;
}

.form-content {
    max-width: 800px;
    margin: 0 auto;
    overflow: visible;
}

.form-group {
    margin-bottom: 1.5rem;
}

.form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #333;
}

.input-help {
    margin-top: 0.5rem;
    font-size: 0.9rem;
    color: #666;
}

.file-upload-wrapper {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 0.5rem;
}

.file-input {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    border: 0;
}

.file-upload-button {
    display: inline-block;
    padding: 0.75rem 1.5rem;
    background: #4263EB;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 1.1rem;
    font-weight: 500;
}

.file-upload-button:hover {
    background: #3b5bdb;
    transform: translateY(-2px);
}

.file-name {
    color: #666;
    font-size: 0.9rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 300px;
}

.submit-button {
    background: #4263EB;
    color: white;
    border: none;
    padding: 1rem 2rem;
    border-radius: 8px;
    font-size: 1.1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
}

.submit-button:hover {
    background: #3b5bdb;
}

.petsitter-management {
    min-height: 0;
    height: auto;
}

.application-form h2 {
    color: #333;
    margin-bottom: 2rem;
}

.form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #333;
}

.form-input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 0.9rem;
    color: #333;
}

.file-name {
    color: #666;
    font-size: 0.9rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 300px;
}

.service-tag {
    display: inline-flex;
    align-items: center;
    background: #e6f3ff;
    color: #0066cc;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-size: 0.9rem;
}

.status-value {
    color: #4263EB;
    font-size: 1.8rem;
    font-weight: bold;
    margin-bottom: 0.25rem;
}

.status-sub {
    color: #666;
    font-size: 0.9rem;
}

.info-item h3 {
    color: #333;
    font-weight: 500;
    margin-bottom: 0.5rem;
}

.info-item p {
    color: #444;
    line-height: 1.5;
}

textarea.form-input {
    color: #333;
}

input::placeholder,
textarea::placeholder {
    color: #999;
}

.label-group {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 0.5rem;
}

.warning-text {
    color: #dc3545;
    font-size: 0.85rem;
}

.document-upload {
    margin-top: 1rem;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 4px;
}

.code-groups-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
    margin-top: 1rem;
}

.code-group-item {
    padding: 1rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    background-color: #f8f9fa;
}

.checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 500;
    margin-bottom: 0.5rem;
}

.checkbox-label input {
    width: auto;
}

.description {
    display: block;
    font-size: 0.9em;
    color: #666;
}

.full-width {
    grid-column: 1 / -1;
}

.code-groups-display {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    margin-top: 0.5rem;
}

.code-group-tag {
    background-color: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    padding: 0.75rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.group-name {
    font-weight: 500;
    color: #4263EB;
}

.group-description {
    font-size: 0.9em;
    color: #666;
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

.client-name {
    font-weight: 600;
    font-size: 1.1rem;
}

.status-badge {
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: 500;
}

.confirming { background: #e3f2fd; color: #1976d2; }
.perchasing { background: #e8f5e9; color: #2e7d32; }
.confirmed { background: #e0f7fa; color: #00838f; }
.cancelled { background: #ffebee; color: #c62828; }

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

.reservation-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 1rem;
}

.approve-button {
    padding: 0.75rem 1.5rem;
    background: #4263EB;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.approve-button:hover {
    background: #3b5bdb;
}

.status-badge.confirming:hover {
    background: #1976d2;
    color: white;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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