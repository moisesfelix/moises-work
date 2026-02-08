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

<script setup lang="ts">
import { ref, provide, onMounted } from 'vue';
import { useStore } from 'vuex';
import TheHeader from '@/components/TheHeader.vue';
import TheFooter from '@/components/TheFooter.vue';
import TheToast from '@/components/TheToast.vue';

const toast = ref(null);
const store = useStore();

const showToast = (toastDetails: { message: string; type: string, title: string }) => {
  if (toast.value) {
    (toast.value as any).addToast(toastDetails);
  }
};

provide('showToast', showToast);

onMounted(() => {
  store.dispatch('theme/loadTheme');
});
</script>