<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <h3>{{ isEdit ? '코드 그룹 수정' : '코드 그룹 추가' }}</h3>
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="group_id">그룹 ID</label>
          <input 
            id="group_id"
            v-model="form.group_id"
            type="text"
            required
            :disabled="isEdit"
          >
        </div>
        <div class="form-group">
          <label for="group_name">그룹명</label>
          <input 
            id="group_name"
            v-model="form.group_name"
            type="text"
            required
          >
        </div>
        <div class="form-group">
          <label for="description">설명</label>
          <textarea 
            id="description"
            v-model="form.description"
            rows="3"
          ></textarea>
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
  isEdit?: boolean
  initialData?: {
    group_id?: string
    group_name?: string
    description?: string
  }
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit', data: { group_id: string; group_name: string; description: string }): void
}>()

const form = ref({
  group_id: props.initialData?.group_id || '',
  group_name: props.initialData?.group_name || '',
  description: props.initialData?.description || ''
})

const handleSubmit = () => {
  emit('submit', {
    group_id: form.value.group_id,
    group_name: form.value.group_name,
    description: form.value.description
  })
}
</script>

<style scoped>
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