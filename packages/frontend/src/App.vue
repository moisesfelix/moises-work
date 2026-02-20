<template>
  <div id="app-container">
    <router-view></router-view>
    <TheToast ref="toast" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, provide } from "vue";
import { useUiStore } from "@/stores/ui";
import TheToast from "@/components/TheToast.vue";

const uiStore = useUiStore();
const toast   = ref<InstanceType<typeof TheToast> | null>(null);

const showToast = (
  message: string,
  type: "success" | "error" | "warning" | "info" = "info",
  title = "Notification"
) => {
  if (toast.value) {
    toast.value.addToast({ message, type, title });
  }
};

provide("showToast", showToast);

onMounted(() => {
  uiStore.loadTheme();
});
</script>