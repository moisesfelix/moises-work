
import type { Module } from 'vuex';
import type { Project, Article, Tutorial, Experience } from 'shared';
import { db } from '@/firebase/config';
import { ref, get, set, remove } from 'firebase/database';

interface PortfolioState {
  projects: Project[];
  articles: Article[];
  tutorials: Tutorial[];
  skills: any;
  experiences: Experience[];
  about: any;
  contact: any;
}

const portfoliosModule: Module<PortfolioState, any> = {
  namespaced: true,
  state: {
    projects: [],
    articles: [],
    tutorials: [],
    skills: {},
    experiences: [],
    about: null,
    contact: null,
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
    },
    setContact(state, contact) {
        state.contact = contact;
    },
    setAbout(state, about) {
        state.about = about;
    },
    setProjects(state, projects) {
        state.projects = projects;
    },
    setArticles(state, articles) {
        state.articles = articles;
    },
    setTutorials(state, tutorials) {
        state.tutorials = tutorials;
    },
    setSkills(state, skills) {
        state.skills = skills;
    },
    setExperiences(state, experiences) {
        state.experiences = experiences;
    },
  },
  actions: {
    async fetchPortfolioData({ commit }) {
      commit('ui/setLoading', true, { root: true });
      try {
        const dbRef = ref(db, '/');
        const snapshot = await get(dbRef);
        if (snapshot.exists()) {
          commit('setPortfolioData', snapshot.val());
        } else {
          console.log("No data available");
          commit('setPortfolioData', {});
        }
      } catch (error: any) {
        console.error("Firebase fetch error:", error);
        commit('ui/setError', error.message, { root: true });
      } finally {
        commit('ui/setLoading', false, { root: true });
      }
    },
    async fetchData({ commit }, type: string) {
      commit('ui/setLoading', true, { root: true });
      commit('ui/setError', null, { root: true });

      try {
        const dbRef = ref(db, `/${type}`);
        const snapshot = await get(dbRef);

        if (snapshot.exists()) {
          const data = snapshot.val();
          const mutation = `set${type.charAt(0).toUpperCase() + type.slice(1)}`;
          commit(mutation, data);
        } else {
          // Handle case where data doesn't exist
        }
      } catch (error: any) {
        commit('ui/setError', error.message, { root: true });
        console.error(`Error fetching ${type}:`, error);
      } finally {
        commit('ui/setLoading', false, { root: true });
      }
    },
    async saveData({ dispatch, commit }, { type, data }) {
      commit('ui/setLoading', true, { root: true });
      commit('ui/setError', null, { root: true });

      try {
        const dataPath = `/${type}`;
        await set(ref(db, dataPath), data);
        await dispatch('fetchPortfolioData');
      } catch (error: any) {
        commit('ui/setError', error.message, { root: true });
        throw error;
      } finally {
        commit('ui/setLoading', false, { root: true });
      }
    },
    async deleteData({ dispatch, commit }, { type, id }) {
      commit('ui/setLoading', true, { root: true });
      commit('ui/setError', null, { root: true });

      try {
        const dataPath = `/${type}/${id}`;
        await remove(ref(db, dataPath));
        await dispatch('fetchPortfolioData');
      } catch (error: any) {
        commit('ui/setError', error.message, { root: true });
        throw error;
      } finally {
        commit('ui/setLoading', false, { root: true });
      }
    },
    async deleteArticleWithImage({ state, dispatch, commit }, article: Article) {
        commit('ui/setLoading', true, { root: true });
        commit('ui/setError', null, { root: true });
  
        try {
          if (article.image) {
            // await storageService.deleteImage(article.image);
          }
          const currentArticles = state.articles || [];
          const updatedArticles = currentArticles.filter(a => a.id !== article.id);
          await dispatch('saveData', { type: 'articles', data: updatedArticles });
        } catch (error: any) {
          commit('ui/setError', error.message, { root: true });
          throw error;
        } finally {
          commit('ui/setLoading', false, { root: true });
        }
      },
  
      async deleteTutorialWithImage({ state, dispatch, commit }, tutorial: Tutorial) {
        commit('ui/setLoading', true, { root: true });
        commit('ui/setError', null, { root: true });
  
        try {
          if (tutorial.image) {
            // await storageService.deleteImage(tutorial.image);
          }
          const currentTutorials = state.tutorials || [];
          const updatedTutorials = currentTutorials.filter(t => t.id !== tutorial.id);
          await dispatch('saveData', { type: 'tutorials', data: updatedTutorials });
        } catch (error: any) {
          commit('ui/setError', error.message, { root: true });
          throw error;
        } finally {
          commit('ui/setLoading', false, { root: true });
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
    },
  }
};

export default portfoliosModule;
