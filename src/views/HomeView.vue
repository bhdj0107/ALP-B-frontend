<script setup lang="ts">
    import Card from '../components/Card/Card.vue';
    import serviceImage from '@/assets/service.jpg?url';
    import shopImage from '@/assets/shop.jpg?url';
    import manageImage from '@/assets/manage.webp?url';
</script>

<template>
    <div class="home">
        <div class="banner">
            <div class="banner-gradient"></div>
        </div>
        <div class="card-container">
            <div class="card-wrapper">
                <router-link to="/shopping" custom v-slot="{ navigate }">
                    <div class="card-link" @click="navigate">
                        <Card :data="{ imageSrc: shopImage, text: '쇼핑' }" />
                    </div>
                </router-link>
            </div>
            <div class="card-wrapper">
                <router-link to="/petsitter" custom v-slot="{ navigate }">
                    <div class="card-link" @click="navigate">
                        <Card :data="{ imageSrc: serviceImage, text: '펫시터 서비스' }" />
                    </div>
                </router-link>
            </div>
            <div class="card-wrapper">
                <router-link to="/management" custom v-slot="{ navigate }">
                    <div class="card-link" @click="navigate">
                        <Card :data="{ imageSrc: manageImage, text: '반려동물 관리' }" />
                    </div>
                </router-link>
            </div>
        </div>
    </div>
</template>

<style scoped>
.home {
    width: 100%;
    height: 100%;
}

.banner {
    width: 100%;
    height: 500px;
    background-image: url('@/assets/banner.jpg');
    background-size: cover;
    background-position: center 30%;
    position: relative;
    overflow: hidden;
}

.banner-gradient {
    position: absolute;
    bottom: 0;
    width: 100%;
    height: 100px;
    background: linear-gradient(to bottom, transparent, #f5f5f5);
}

.card-container {
    display: flex;
    flex-direction: row;
    justify-content: center;
    gap: 2rem;
    padding: 2rem;
    position: relative;
    z-index: 1;
}

.card-wrapper {
    width: 100%;
}

.card-link {
    text-decoration: none;
    color: inherit;
    background: none;
    cursor: pointer;
}

.card-link:hover {
    background: none;
}

:deep(a.router-link-active),
:deep(a.router-link-exact-active) {
    background-color: transparent;
    color: inherit;
}
</style> 