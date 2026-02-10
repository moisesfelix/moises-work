<script setup lang="ts">
import { computed } from 'vue';
import { useStore } from 'vuex';
import TheHeader from '../components/TheHeader.vue';
import TheFooter from '../components/TheFooter.vue';

const store = useStore();
const isAuthenticated = computed(() => store.getters.isAuthenticated);
</script>

<template>
  <div class="app-container">
    <TheHeader />
    <div class="layout-container">
      <main class="main-content">
        <router-view />
      </main>
    </div>
    <TheFooter v-if="!isAuthenticated" />
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}
.layout-container {
  display: flex;
  flex: 1;
  overflow: hidden;
}
.main-content {
  flex: 1;
  overflow-y: auto;
  padding-top: var(--header-height);
}
</style>