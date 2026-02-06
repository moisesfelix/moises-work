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
    <TheToast ref="toast" />
  </div>
</template>

<script setup>
import { ref, provide, onMounted } from 'vue';
import TheHeader from '@/components/TheHeader.vue';
import TheFooter from '@/components/TheFooter.vue';
import TheToast from '@/components/TheToast.vue';

const toast = ref(null);

const showToast = (toastDetails) => {
  if (toast.value) {
    toast.value.addToast(toastDetails);
  }
};

provide('showToast', showToast);

</script>