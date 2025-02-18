<template>
  <div class="admin-management">
    <div class="admin-layout">
      <!-- 왼쪽 세로 탭 메뉴 -->
      <div class="tab-menu">
        <div 
          v-for="tab in tabs" 
          :key="tab.id"
          :class="['tab-item', { active: currentTab === tab.id }]"
          @click="currentTab = tab.id"
        >
          {{ tab.name }}
        </div>
      </div>

      <!-- 오른쪽 컨텐츠 영역 -->
      <div class="tab-content">
        <!-- 메뉴 관리 -->
        <div v-if="currentTab === 'menu'" class="content-section">
          <h3>메뉴 관리</h3>
          <!-- 메뉴 관리 컨텐츠 구현 예정 -->
        </div>

        <!-- 회원 관리 -->
        <div v-if="currentTab === 'member'" class="content-section">
          <h3>회원 관리</h3>
          <!-- 회원 관리 컨텐츠 구현 예정 -->
        </div>

        <!-- 코드 관리 -->
        <div v-if="currentTab === 'code'" class="content-section">
          <div class="code-management">
            <!-- 코드 그룹 섹션 -->
            <div class="code-group-section">
              <div class="section-header">
                <h4>코드그룹</h4>
                <div class="button-group">
                  <button class="btn-add" @click="showGroupModal = true">추가</button>
                  <button class="btn-delete" @click="deleteCodeGroups" 
                          :disabled="selectedGroups.length !== 1">삭제</button>
                </div>
              </div>
              <div class="grid-table">
                <div class="grid-header">
                  <div class="checkbox-cell">
                    <input type="checkbox" @change="toggleAllCodeGroups">
                  </div>
                  <div>그룹ID</div>
                  <div>그룹명</div>
                  <div>설명</div>
                </div>
                <div class="grid-body">
                  <div v-for="group in codeGroups" :key="group.group_id" class="grid-row" :class="{ 'selected': selectedGroupId === group.group_id }" @click="handleGroupSelect(group.group_id)">
                    <div class="checkbox-cell">
                      <input type="checkbox" v-model="selectedGroups" :value="group.group_id">
                    </div>
                    <div>{{ group.group_id }}</div>
                    <div>{{ group.group_name }}</div>
                    <div>{{ group.description }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 코드 상세 섹션 -->
            <div class="code-detail-section">
              <div class="section-header">
                <h4>코드상세</h4>
                <div class="button-group">
                  <button class="btn-add" @click="showDetailModal = true" 
                          :disabled="!selectedGroupId">추가</button>
                  <button class="btn-delete" @click="deleteCodeDetails"
                          :disabled="!selectedDetails.length">삭제</button>
                </div>
              </div>
              <div class="grid-table">
                <div class="grid-header">
                  <div class="checkbox-cell">
                    <input type="checkbox" @change="toggleAllCodeDetails">
                  </div>
                  <div>순서</div>
                  <div>코드ID</div>
                  <div>코드명</div>
                  <div>코드값</div>
                  <div>사용여부</div>
                </div>
                <div class="grid-body">
                  <div v-for="detail in codeDetails" :key="detail.code_id" class="grid-row">
                    <div class="checkbox-cell">
                      <input type="checkbox" v-model="selectedDetails" :value="detail.code_id">
                    </div>
                    <div>{{ detail.sort_order }}</div>
                    <div>{{ detail.code_id }}</div>
                    <div>{{ detail.code_name }}</div>
                    <div>{{ detail.code_value }}</div>
                    <div>
                      <span :class="['status-badge', detail._active ? 'active' : 'inactive']">
                        {{ detail._active ? '사용' : '미사용' }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 모달 컴포넌트 -->
    <CodeGroupModal 
      v-if="showGroupModal"
      @close="showGroupModal = false"
      @submit="createCodeGroup"
    />

    <!-- 코드 상세 모달 -->
    <div v-if="showDetailModal" class="modal">
        <div class="modal-content">
            <h2>코드 상세 정보</h2>
            <form @submit.prevent="saveCodeDetail">
                <div class="form-group">
                    <label for="codeId">코드 ID</label>
                    <input 
                        id="codeId"
                        v-model="newCodeDetail.code_id" 
                        type="text" 
                        required
                    >
                </div>
                <div class="form-group">
                    <label for="codeValue">코드 값</label>
                    <input 
                        id="codeValue"
                        v-model="newCodeDetail.code_value" 
                        type="text" 
                        required
                    >
                </div>
                <div class="form-group">
                    <label for="codeName">코드 이름</label>
                    <input 
                        id="codeName"
                        v-model="newCodeDetail.code_name" 
                        type="text" 
                        required
                    >
                </div>
                <div class="form-group">
                    <label for="sortOrder">정렬 순서</label>
                    <input 
                        id="sortOrder"
                        v-model.number="newCodeDetail.sort_order" 
                        type="number" 
                        required
                    >
                </div>
                <div class="form-group checkbox-group">
                    <label for="isActive">
                        <input 
                            id="isActive"
                            v-model="newCodeDetail.is_active" 
                            type="checkbox"
                        >
                        사용 여부
                    </label>
                </div>
                <div class="modal-buttons">
                    <button type="button" class="cancel-button" @click="closeDetailModal">취소</button>
                    <button type="submit" class="submit-button">저장</button>
                </div>
            </form>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import type { CodeGroup, CodeDetail } from '@/types/code'
import axios from 'axios'
import { useToast } from 'vue-toastification'
import CodeGroupModal from '@/components/modals/CodeGroupModal.vue'
import CodeDetailModal from '@/components/modals/CodeDetailModal.vue'

const toast = useToast()
const tabs = [
  { id: 'menu', name: '메뉴관리' },
  { id: 'member', name: '회원관리' },
  { id: 'code', name: '코드관리' }
]

const currentTab = ref('menu')
const selectedGroups = ref<string[]>([])
const selectedDetails = ref<string[]>([])
const codeGroups = ref<CodeGroup[]>([])
const codeDetails = ref<CodeDetail[]>([])
const selectedGroupId = ref<string | null>(null)
const showGroupModal = ref(false)
const showDetailModal = ref(false)
const newCodeDetail = ref({
    code_id: '',
    code_value: '',
    code_name: '',
    sort_order: 0,
    is_active: true
})

// API 호출 함수들
const fetchCodeGroups = async () => {
  try {
    const response = await axios.get('/codes/groups')
    codeGroups.value = response.data
  } catch (error) {
    toast.error('코드 그룹 목록을 불러오는데 실패했습니다.')
    console.error('Error fetching code groups:', error)
  }
}

const fetchCodeDetails = async (groupId?: string) => {
  try {
    const url = groupId 
      ? `/codes/groups/${groupId}/details`
      : '/codes/details'
    const response = await axios.get(url)
    codeDetails.value = response.data
  } catch (error) {
    toast.error('코드 상세 목록을 불러오는데 실패했습니다.')
    console.error('Error fetching code details:', error)
  }
}

// 코드 그룹 생성
const createCodeGroup = async (data: {
  group_id: string
  group_name: string
  description: string
}) => {
  try {
    await axios.post('/codes/groups', data)
    toast.success('코드 그룹이 생성되었습니다.')
    await fetchCodeGroups()
    showGroupModal.value = false
  } catch (error) {
    toast.error('코드 그룹 생성에 실패했습니다.')
    console.error('Error creating code group:', error)
  }
}

// 코드 상세 생성
const createCodeDetail = async (data: {
  code_id: string
  group_id: string
  code_name: string
  code_value: string
  sort_order: number
  is_active: boolean
}) => {
  try {
    await axios.post('/codes/details', data)
    toast.success('코드가 생성되었습니다.')
    await fetchCodeDetails(selectedGroupId.value)
    showDetailModal.value = false
  } catch (error) {
    toast.error('코드 생성에 실패했습니다.')
    console.error('Error creating code detail:', error)
  }
}

// 코드 그룹 삭제
const deleteCodeGroups = async () => {
  if (!selectedGroups.value.length) {
    toast.warning('삭제할 코드 그룹을 선택해주세요.')
    return
  }

  // 확인 대화상자 표시
  if (!confirm('선택한 코드 그룹과 하위의 모든 코드가 삭제됩니다.\n계속하시겠습니까?')) {
    return
  }

  try {
    const groupId = selectedGroups.value[0]
    await axios.delete('/codes/groups', { data: groupId })
    toast.success('코드 그룹과 하위 코드들이 삭제되었습니다.')
    selectedGroups.value = []
    selectedGroupId.value = null
    await fetchCodeGroups()
    await fetchCodeDetails()
  } catch (error) {
    toast.error('코드 그룹 삭제에 실패했습니다.')
    console.error('Error deleting code group:', error)
  }
}

// 코드 상세 삭제
const deleteCodeDetails = async () => {
  if (!selectedDetails.value.length) {
    toast.warning('삭제할 코드를 선택해주세요.')
    return
  }

  try {
    await axios.delete('/codes/details', {
      data: selectedDetails.value
    })
    toast.success('선택한 코드가 삭제되었습니다.')
    selectedDetails.value = []
    await fetchCodeDetails(selectedGroupId.value ?? undefined)
  } catch (error) {
    toast.error('코드 삭제에 실패했습니다.')
    console.error('Error deleting code details:', error)
  }
}

// 코드 그룹 선택 시 해당 그룹의 상세 코드 조회
const handleGroupSelect = async (groupId: string) => {
  selectedGroupId.value = groupId
  await fetchCodeDetails(groupId)
}

// 체크박스 전체 선택/해제
const toggleAllCodeGroups = (event: Event) => {
  const checked = (event.target as HTMLInputElement).checked
  if (checked) {
    selectedGroups.value = codeGroups.value.map(group => group.group_id)
  } else {
    selectedGroups.value = []
  }
}

const toggleAllCodeDetails = (event: Event) => {
  const checked = (event.target as HTMLInputElement).checked
  if (checked) {
    selectedDetails.value = codeDetails.value.map(detail => detail.code_id)
  } else {
    selectedDetails.value = []
  }
}

// 컴포넌트 마운트 시 초기 데이터 로드
onMounted(async () => {
  if (currentTab.value === 'code') {
    await fetchCodeGroups()
    await fetchCodeDetails()
  }
})

// 탭 변경 시 코드 관리 데이터 로드
watch(currentTab, async (newTab) => {
  if (newTab === 'code') {
    await fetchCodeGroups()
    await fetchCodeDetails()
  }
})

// 모달 닫기
const closeDetailModal = () => {
    showDetailModal.value = false;
    newCodeDetail.value = {
        code_id: '',
        code_value: '',
        code_name: '',
        sort_order: 0,
        is_active: true
    };
};

// 코드 상세 저장
const saveCodeDetail = async () => {
    try {
        if (!selectedGroupId.value) {
            toast.error('코드 그룹을 선택해주세요.');
            return;
        }

        const data = {
            ...newCodeDetail.value,
            group_id: selectedGroupId.value
        };

        await axios.post('/codes/details', data);
        toast.success('코드가 생성되었습니다.');
        await fetchCodeDetails(selectedGroupId.value);
        showDetailModal.value = false;
    } catch (error) {
        console.error('코드 생성 실패:', error);
        toast.error('코드 생성에 실패했습니다.');
    }
};

// 코드 상세 추가 버튼 클릭 핸들러
const handleAddCodeDetail = () => {
    if (!selectedGroupId.value) {
        toast.error('코드 그룹을 선택해주세요.');
        return;
    }
    showDetailModal.value = true;
};
</script>

<style scoped>
.admin-management {
  width: 100%;
  height: 100%;
}

.admin-layout {
  display: flex;
  gap: 20px;
  height: 100%;
  width: 100%;
}

.tab-menu {
  width: 200px;
  background-color: #f5f5f5;
  padding: 20px 0;
  flex-shrink: 0;
}

.tab-item {
  padding: 15px 20px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.tab-item:hover {
  background-color: #e9ecef;
}

.tab-item.active {
  background-color: #e9ecef;
  font-weight: bold;
}

.tab-content {
  flex: 1;
  min-width: 0;
}

.content-section {
  width: 100%;
  height: 100%;
}

.code-management {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.code-group-section,
.code-detail-section {
  width: 100%;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.button-group {
  display: flex;
  gap: 10px;
}

.button-group button {
  padding: 6px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.button-group .btn-add {
  background-color: #007bff;
  border-color: #007bff;
  color: white;
}

.button-group .btn-add:hover {
  background-color: #0069d9;
  border-color: #0062cc;
}

.button-group .btn-delete {
  background-color: #dc3545;
  border-color: #dc3545;
  color: white;
}

.button-group .btn-delete:hover {
  background-color: #c82333;
  border-color: #bd2130;
}

.grid-table {
  width: 100%;
  overflow-x: auto;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.grid-header {
  display: grid;
  background-color: #f8f9fa;
  border-bottom: 2px solid #dee2e6;
  font-weight: bold;
}

.code-group-section .grid-header,
.code-group-section .grid-row {
  grid-template-columns: 50px 150px 200px 1fr;
  min-width: 600px;
}

.code-detail-section .grid-header,
.code-detail-section .grid-row {
  grid-template-columns: 50px 80px 150px 200px 200px 100px;
  min-width: 780px;
}

.grid-row {
  display: grid;
  align-items: center;
  border-bottom: 1px solid #dee2e6;
  transition: background-color 0.2s;
}

.grid-header > div,
.grid-row > div {
  padding: 12px 8px;
  text-align: center;
  border-right: 1px solid #dee2e6;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.grid-header > div:last-child,
.grid-row > div:last-child {
  border-right: none;
}

.grid-row:hover {
  background-color: #f8f9fa;
}

.grid-row.selected {
  background-color: #e9ecef;
}

.checkbox-cell {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 !important;
}

.checkbox-cell input {
  margin: 0;
  cursor: pointer;
}

.grid-body {
  max-height: 400px;
  overflow-y: auto;
  /* Firefox 스크롤바 스타일링 */
  scrollbar-width: thin;
  scrollbar-color: #dee2e6 #f8f9fa;
}

/* Chrome/Safari 스크롤바 스타일링 */
.grid-body::-webkit-scrollbar {
  width: 8px;
}

.grid-body::-webkit-scrollbar-track {
  background: #f8f9fa;
}

.grid-body::-webkit-scrollbar-thumb {
  background-color: #dee2e6;
  border-radius: 4px;
}

.status-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.85em;
  min-width: 60px;
}

.status-badge.active {
  background-color: #e6f4ea;
  color: #1e7e34;
}

.status-badge.inactive {
  background-color: #feeced;
  color: #dc3545;
}

h3, h4 {
  margin: 0;
  color: #333;
}

.button-group button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-content {
    background-color: white;
    padding: 2rem;
    border-radius: 8px;
    width: 90%;
    max-width: 500px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.modal-content h2 {
    margin-bottom: 1.5rem;
    font-size: 1.5rem;
    color: #333;
}

.form-group {
    margin-bottom: 1.2rem;
}

.form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #333;
}

.form-group input[type="text"],
.form-group input[type="number"] {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
}

.form-group input[type="text"]:focus,
.form-group input[type="number"]:focus {
    border-color: #4263eb;
    outline: none;
    box-shadow: 0 0 0 2px rgba(66, 99, 235, 0.2);
}

.checkbox-group {
    display: flex;
    align-items: center;
}

.checkbox-group label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
}

.checkbox-group input[type="checkbox"] {
    width: 16px;
    height: 16px;
    cursor: pointer;
}

.modal-buttons {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 2rem;
}

.cancel-button,
.submit-button {
    padding: 0.6rem 1.2rem;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s;
}

.cancel-button {
    background-color: #e9ecef;
    color: #495057;
}

.cancel-button:hover {
    background-color: #dee2e6;
}

.submit-button {
    background-color: #4263eb;
    color: white;
}

.submit-button:hover {
    background-color: #3b5bdb;
}
</style> 