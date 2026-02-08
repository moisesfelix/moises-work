import { createStore, Store } from 'vuex';
import type { Project, Article, Tutorial, Skill, Experience } from 'shared';
import { db } from '@/firebase/config';
import { ref, get } from 'firebase/database';

// Define the state for the theme module
interface ThemeState {
  currentTheme: 'light' | 'dark';
}


interface AboutState {
  title: string;
  description: string;
  image: string;
}

interface State {
  isLoading: boolean;
  projects: Project[];
  articles: Article[];
  tutorials: Tutorial[];
  skills: any;
  experiences: Experience[];
  theme: ThemeState;
  about: AboutState | null;
  contact: any;
}

const themeModule = {
  namespaced: true,
  state: {
    currentTheme: localStorage.getItem('theme') as 'light' | 'dark' || 'dark'
  },
  mutations: {
    setTheme(state: ThemeState, theme: 'light' | 'dark') {
      state.currentTheme = theme;
      localStorage.setItem('theme', theme);
      document.documentElement.className = theme + '-theme';
    }
  },
  actions: {
    toggleTheme({ commit, state }: { commit: any, state: ThemeState }) {
      const newTheme = state.currentTheme === 'light' ? 'dark' : 'light';
      commit('setTheme', newTheme);
    },
    loadTheme({ commit }: { commit: any }) {
      const theme = localStorage.getItem('theme') as 'light' | 'dark' || 'dark';
      commit('setTheme', theme);
    }
  }
};

const store: Store<State> = createStore({
  state: {
    isLoading: true,
    projects: [],
    articles: [],
    tutorials: [],
    skills: {},
    experiences: [],
    about: null,
    contact: null
  } as State,
  
  modules: {
    theme: themeModule
  },

  mutations: {
    setPortfolioData(state, payload) {
      state.projects = payload.projects || [];
      state.articles = payload.articles || [];
      state.tutorials = payload.tutorials || [];
      state.skills = payload.skills || {};
      state.experiences = payload.experiences || [];
      state.about = payload.about || null;
      state.contact = payload.contact || null;
      state.isLoading = false;
    }
  },

  actions: {
    async fetchPortfolioData({ commit }) {
      try {
        const dbRef = ref(db, '/');
        const snapshot = await get(dbRef);
        if (snapshot.exists()) {
          commit('setPortfolioData', snapshot.val());
        } else {
          console.log("No data available");
          commit('setPortfolioData', {});
        }
      } catch (error) {
        console.error("Firebase fetch error:", error);
      }
    }
  },

  getters: {
    getArticleBySlug: (state) => (slug: string) => {
        return state.articles.find(article => article.slug === slug);
    },
    getTutorialBySlug: (state) => (slug: string) => {
        return state.tutorials.find(tutorial => tutorial.slug === slug);
    },
    getLatestArticles: (state) => (limit: number = 3) => {
        return [...state.articles].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, limit);
    }
  }
});

export default store;
