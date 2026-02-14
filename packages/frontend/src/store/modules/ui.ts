
import type { Module } from 'vuex';

interface UIState {
  isLoading: boolean;
  error: string | null;
  currentTheme: 'light' | 'dark';
  toast: { show: boolean; message: string; type: 'success' | 'error' | 'warning' | 'info' };
}

const uiModule: Module<UIState, any> = {
  namespaced: true,
  state: {
    isLoading: false,
    error: null,
    currentTheme: (localStorage.getItem('theme') as 'light' | 'dark') || 'dark',
    toast: { show: false, message: '', type: 'info' }
  },
  mutations: {
    setLoading(state, isLoading: boolean) {
      state.isLoading = isLoading;
    },
    setError(state, error: string | null) {
      state.error = error;
    },
    setTheme(state, theme: 'light' | 'dark') {
      state.currentTheme = theme;
      localStorage.setItem('theme', theme);
      document.documentElement.className = theme + '-theme';
    },
    showToast(state, payload: { message: string; type: 'success' | 'error' | 'warning' | 'info' }) {
        state.toast = { show: true, message: payload.message, type: payload.type };
    },
    hideToast(state) {
        state.toast.show = false;
    }
  },
  actions: {
    toggleTheme({ commit, state }) {
      const newTheme = state.currentTheme === 'light' ? 'dark' : 'light';
      commit('setTheme', newTheme);
    },
    loadTheme({ commit }) {
      const theme = (localStorage.getItem('theme') as 'light' | 'dark') || 'dark';
      commit('setTheme', theme);
      document.documentElement.className = theme + '-theme';
    },
    triggerToast({ commit }, payload: { message: string; type: 'success' | 'error' | 'warning' | 'info'; duration?: number }) {
        commit('showToast', payload);
        setTimeout(() => {
            commit('hideToast');
        }, payload.duration || 3000);
    }
  },
};

export default uiModule;
