<script setup lang="ts">
</script>

<template>
    <div class="pet-management">
        <h2>내 반려동물</h2>
        <p>등록된 반려동물이 없습니다.</p>
        <button class="add-button">반려동물 등록</button>
    </div>
</template>

<style scoped>
.add-button {
    background: #4263EB;
    color: white;
    width: auto;
    display: inline-block;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.3s ease;
    border: none;
    font-weight: 500;
}

.add-button:hover {
    background: #3b5bdb;
}
</style> 