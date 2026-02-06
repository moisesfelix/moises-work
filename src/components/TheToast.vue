<template>
  <div class="toast-container">
    <transition-group name="toast" tag="div">
      <div v-for="toast in toasts" :key="toast.id" :class="['toast', toast.type]">
        <div class="toast-icon">
          <i :class="iconClass(toast.type)"></i>
        </div>
        <div class="toast-content">
          <div class="toast-title">{{ toast.title }}</div>
          <div class="toast-message">{{ toast.message }}</div>
        </div>
        <button class="toast-close" @click="removeToast(toast.id)">&times;</button>
        <div class="toast-progress" :style="{ animationDuration: (toast.duration || 5000) + 'ms' }"></div>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const toasts = ref([]);
let idCounter = 0;

const addToast = (toast) => {
  const id = idCounter++;
  const newToast = {
    id,
    type: toast.type || 'info',
    title: toast.title || 'Notification',
    message: toast.message,
    duration: toast.duration || 5000,
  };
  toasts.value.unshift(newToast);

  setTimeout(() => {
    removeToast(id);
  }, newToast.duration);
};

const removeToast = (id) => {
  const index = toasts.value.findIndex(toast => toast.id === id);
  if (index > -1) {
    toasts.value.splice(index, 1);
  }
};

const iconClass = (type) => {
  const icons = {
    success: 'fas fa-check-circle',
    error: 'fas fa-times-circle',
    warning: 'fas fa-exclamation-triangle',
    info: 'fas fa-info-circle',
  };
  return icons[type] || icons.info;
};

defineExpose({
  addToast,
});
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.toast {
  display: flex;
  align-items: flex-start;
  padding: 1rem;
  background: var(--dark-light);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  border-left: 4px solid;
  width: 350px;
  max-width: 90vw;
  position: relative;
  overflow: hidden;
}

.toast.success { border-color: var(--success); }
.toast.error { border-color: var(--danger); }
.toast.warning { border-color: var(--warning); }
.toast.info { border-color: var(--primary); }

.toast-icon {
  font-size: 1.5rem;
  margin-right: 1rem;
}
.toast.success .toast-icon { color: var(--success); }
.toast.error .toast-icon { color: var(--danger); }
.toast.warning .toast-icon { color: var(--warning); }
.toast.info .toast-icon { color: var(--primary); }

.toast-content {
  flex-grow: 1;
}

.toast-title {
  font-weight: 700;
  color: var(--light);
  margin-bottom: 0.25rem;
}

.toast-message {
  color: var(--gray);
}

.toast-close {
  background: none;
  border: none;
  color: var(--gray);
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  margin-left: 1rem;
}

.toast-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 4px;
  background-color: currentColor;
  width: 100%;
  animation: progress linear forwards;
}

@keyframes progress {
  from { width: 100%; }
  to { width: 0%; }
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.5s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>
