
import type { Module } from 'vuex';

interface UIState {
  isLoading: boolean;
  error: string | null;
  currentTheme: 'light' | 'dark';
}

const uiModule: Module<UIState, any> = {
  namespaced: true,
  state: {
    isLoading: false,
    error: null,
    currentTheme: (localStorage.getItem('theme') as 'light' | 'dark') || 'dark',
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
  },
};

export default uiModule;
