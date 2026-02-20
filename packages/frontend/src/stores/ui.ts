import { defineStore } from 'pinia';

export const useUiStore = defineStore('ui', {
  state: () => ({
    isLoading: false,
    error: null as string | null,
    currentTheme: (localStorage.getItem('theme') as 'light' | 'dark') || 'dark',
    toast: {
      show: false,
      message: '',
      type: 'info' as 'success' | 'error' | 'warning' | 'info',
    },
  }),
  actions: {
    setLoading(isLoading: boolean) {
      this.isLoading = isLoading;
    },
    setError(error: string | null) {
      this.error = error;
    },
    setTheme(theme: 'light' | 'dark') {
      this.currentTheme = theme;
      localStorage.setItem('theme', theme);
      document.documentElement.className = theme + '-theme';
    },
    toggleTheme() {
      this.setTheme(this.currentTheme === 'light' ? 'dark' : 'light');
    },
    loadTheme() {
      const theme = (localStorage.getItem('theme') as 'light' | 'dark') || 'dark';
      this.setTheme(theme);
      document.documentElement.className = theme + '-theme';
    },
    showToast(payload: { message: string; type: 'success' | 'error' | 'warning' | 'info' }) {
      this.toast = { show: true, message: payload.message, type: payload.type };
    },
    hideToast() {
      this.toast.show = false;
    },
    triggerToast(payload: {
      message: string;
      type: 'success' | 'error' | 'warning' | 'info';
      duration?: number;
    }) {
      this.showToast(payload);
      setTimeout(() => this.hideToast(), payload.duration || 3000);
    },
  },
});
