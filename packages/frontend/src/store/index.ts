import { createStore, Store } from 'vuex';
import type { Project, Article, Tutorial, Skill, Experience } from 'shared';
import { db } from '@/firebase/config';
import { ref, get } from 'firebase/database';

// Tipagem do Estado
interface State {
  isLoading: boolean;
  projects: Project[];
  articles: Article[];
  tutorials: Tutorial[];
  skills: any; // Ajuste conforme a estrutura no Firebase
  experiences: Experience[];
}

const store: Store<State> = createStore({
  state: {
    isLoading: true, // Inicia como 'carregando'
    projects: [],
    articles: [],
    tutorials: [],
    skills: {},
    experiences: []
  },
  
  mutations: {
    // Mutation para preencher o estado com os dados do Firebase
    setPortfolioData(state, payload) {
      state.projects = payload.projects || [];
      state.articles = payload.articles || [];
      state.tutorials = payload.tutorials || [];
      state.skills = payload.skills || {};
      state.experiences = payload.experiences || [];
      state.isLoading = false; // Finaliza o carregamento
    }
  },

  actions: {
    // Action para buscar os dados do Realtime Database
    async fetchPortfolioData({ commit }) {
      try {
        const dbRef = ref(db, '/'); // Referência para a raiz do seu DB
        const snapshot = await get(dbRef);
        if (snapshot.exists()) {
          commit('setPortfolioData', snapshot.val());
        } else {
          console.log("No data available");
          commit('setPortfolioData', {}); // Limpa os dados se não houver nada
        }
      } catch (error) {
        console.error("Firebase fetch error:", error);
        // Opcional: Adicionar uma mutation para estado de erro
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

