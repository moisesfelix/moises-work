<script setup lang="ts">
import { computed } from "vue";
import { useAuthStore } from "@/stores/auth";
import TheHeader from "../components/TheHeader.vue";
import TheFooter from "../components/TheFooter.vue";

const authStore       = useAuthStore();
const isAuthenticated = computed(() => authStore.isAuthenticated);
</script>

<template>
  <div class="app-container">
    <TheHeader />
    <div class="layout-container">
      <main class="main-content">
        <router-view />
      </main>
    </div>
    <TheFooter v-if="!isAuthenticated" class="layout-footer" />
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