<template>
  <div id="app-container">
    <router-view></router-view>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useStore } from 'vuex';

const store = useStore();

onMounted(() => {
  store.dispatch('theme/loadTheme');
  //store.dispatch('fetchPortfolioData'); // Assuming this is now handled in components or view logic
});
</script>