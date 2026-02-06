<template>
  <div id="app-container">
    <!-- Header -->
    <TheHeader />

    <!-- Conteúdo Principal -->
    <main>
        <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
                <component :is="Component" />
            </transition>
        </router-view>
    </main>

    <!-- Footer -->
    <TheFooter />

    <!-- Toast Notification -->
    <transition name="fade">
        <div v-if="toast.show" class="toast" @click="hideToast">
            <i class="fas fa-check-circle"></i>
            <span>{{ toast.message }}</span>
        </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, provide } from 'vue';
import TheHeader from '@/components/TheHeader.vue';
import TheFooter from '@/components/TheFooter.vue';

const toast = ref({
    show: false,
    message: ''
});

const showToast = (message) => {
    toast.value.message = message;
    toast.value.show = true;
    
    setTimeout(() => {
        toast.value.show = false;
    }, 3000);
};

const hideToast = () => {
    toast.value.show = false;
};

provide('showToast', showToast);
</script>