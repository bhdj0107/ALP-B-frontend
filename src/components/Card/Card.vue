<script setup lang="ts">
    import { defineProps } from 'vue';
    export type CardProps = {
        data: {
            imageSrc: string;
            text: string;
        }
    }
    const props = defineProps<CardProps>();

</script>

<template>
    <div class="card">
        <img :src="props.data.imageSrc" :alt="props.data.text">
        <p>{{ props.data.text }}</p>
    </div>
</template>

<script lang="ts">

export default {
    name: 'Card'
};


</script>



<style scoped>
    .card {
        width: 100%;
        height: 250px;
        background-color: #fff;
        border-radius: 20px;
        overflow: hidden;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease-in-out;
    }
    .card img {
        width: 100%;
        height: 70%;
        object-fit: cover;
        border-bottom: 1px solid #eee;
    }
    .card p {
        font-size: 1.2rem;
        font-weight: 500;
        margin: 1rem;
        color: #333;
        text-align: center;
    }
    .card:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }
</style>