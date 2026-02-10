<template>
  <div id="app-container">
    <router-view></router-view>
    <TheToast ref="toast" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, provide } from 'vue';
import { useStore } from 'vuex';
import TheToast from '@/components/TheToast.vue';

const store = useStore();
const toast = ref();

const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', title: string = 'Notification') => {
  if (toast.value) {
    toast.value.addToast({ message, type, title });
  }
};

provide('showToast', showToast);

onMounted(() => {
  store.dispatch('ui/loadTheme');
  //store.dispatch('fetchPortfolioData'); // Assuming this is now handled in components or view logic
});
</script>