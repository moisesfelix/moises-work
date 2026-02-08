<template>
  <button @click="toggleTheme" class="theme-switcher" :aria-label="'Switch to ' + nextTheme + ' mode'">
    <i :class="isDarkMode ? 'fas fa-sun' : 'fas fa-moon'"></i>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useStore } from 'vuex';

const store = useStore();

const isDarkMode = computed(() => store.state.theme.currentTheme === 'dark');
const nextTheme = computed(() => isDarkMode.value ? 'light' : 'dark');

const toggleTheme = () => {
  store.dispatch('theme/toggleTheme');
};
</script>

<style scoped>
.theme-switcher {
  background: none;
  border: none;
  color: var(--text-color-heading);
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0.5rem;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.theme-switcher:hover {
  background-color: rgba(125, 125, 125, 0.1);
  transform: scale(1.1);
}

.theme-switcher i {
  transition: transform 0.3s ease;
}

.theme-switcher:hover i {
    transform: rotate(15deg);
}
</style>
