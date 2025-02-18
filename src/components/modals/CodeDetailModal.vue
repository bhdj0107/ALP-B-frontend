<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <h3>{{ isEdit ? '코드 상세 수정' : '코드 상세 추가' }}</h3>
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="code_id">코드 ID</label>
          <input 
            id="code_id"
            v-model="form.code_id"
            type="text"
            required
            :disabled="isEdit"
          >
        </div>
        <div class="form-group">
          <label for="code_name">코드명</label>
          <input 
            id="code_name"
            v-model="form.code_name"
            type="text"
            required
          >
        </div>
        <div class="form-group">
          <label for="code_value">코드값</label>
          <input 
            id="code_value"
            v-model="form.code_value"
            type="text"
            required
          >
        </div>
        <div class="form-group">
          <label for="sort_order">정렬 순서</label>
          <input 
            id="sort_order"
            v-model.number="form.sort_order"
            type="number"
            required
            min="1"
          >
        </div>
        <div class="form-group">
          <label class="checkbox-label">
            <input 
              type="checkbox"
              v-model="form.is_active"
            >
            사용 여부
          </label>
        </div>
        <div class="button-group">
          <button type="button" class="btn-cancel" @click="$emit('close')">취소</button>
          <button type="submit" class="btn-submit">저장</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  groupId: string
  isEdit?: boolean
  initialData?: {
    code_id?: string
    code_name?: string
    code_value?: string
    sort_order?: number
    is_active?: boolean
  }
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit', data: {
    code_id: string
    group_id: string
    code_name: string
    code_value: string
    sort_order: number
    is_active: boolean
  }): void
}>()

const form = ref({
  code_id: props.initialData?.code_id || '',
  code_name: props.initialData?.code_name || '',
  code_value: props.initialData?.code_value || '',
  sort_order: props.initialData?.sort_order || 1,
  is_active: props.initialData?.is_active ?? true
})

const handleSubmit = () => {
  emit('submit', {
    code_id: form.value.code_id,
    group_id: props.groupId,
    code_name: form.value.code_name,
    code_value: form.value.code_value,
    sort_order: form.value.sort_order,
    is_active: form.value.is_active
  })
}
</script>

<style scoped>
/* CodeGroupModal과 동일한 스타일 사용 */
.modal-overlay {
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
  width: 100%;
  max-width: 500px;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.checkbox-label input {
  width: auto;
}

input, textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.button-group {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

button {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.btn-cancel {
  background-color: #f8f9fa;
  border: 1px solid #ddd;
}

.btn-submit {
  background-color: #007bff;
  border: 1px solid #007bff;
  color: white;
}

input:disabled {
  background-color: #e9ecef;
  cursor: not-allowed;
}
</style> 