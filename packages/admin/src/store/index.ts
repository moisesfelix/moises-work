import { createStore } from 'vuex';
import { db } from '@/firebase/config';
import { ref, set, get, remove } from 'firebase/database';

export default createStore({
  state: {
    projects: [],
    articles: [],
    tutorials: [],
    skills: {},
    experiences: [],
  },
  mutations: {
    setPortfolioData(state, data) {
      state.projects = data.projects || [];
      state.articles = data.articles || [];
      state.tutorials = data.tutorials || [];
      state.skills = data.skills || {};
      state.experiences = data.experiences || [];
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
    }
  },
  actions: {
    async fetchAllData({ commit }) {
      const dbRef = ref(db, '/');
      const snapshot = await get(dbRef);
      if (snapshot.exists()) {
        commit('setPortfolioData', snapshot.val());
      } else {
        console.log('No data available');
        // Reset state if no data
        commit('setPortfolioData', {
          projects: [],
          articles: [],
          tutorials: [],
          skills: {},
          experiences: [],
        });
      }
    },

    async saveData({ state, dispatch }, { type, data }) {
      const dataPath = `/${type}`;
      await set(ref(db, dataPath), data);
      await dispatch('fetchAllData');
    },

    async deleteData({ state, dispatch }, { type, id }) {
      const dataPath = `/${type}/${id}`;
      await remove(ref(db, dataPath));
      await dispatch('fetchAllData');
    },

    async saveSkill({ dispatch, state }, { name, value, oldName }) {
      const skillsRef = ref(db, 'skills');
      let updatedSkills = { ...state.skills };

      if (oldName && oldName !== name) {
        delete updatedSkills[oldName];
      }
      
      updatedSkills[name] = value;
      await set(skillsRef, updatedSkills);
      await dispatch('fetchAllData');
    },

    async deleteSkill({ dispatch, state }, name) {
      const skillsRef = ref(db, 'skills');
      let updatedSkills = { ...state.skills };
      delete updatedSkills[name];
      await set(skillsRef, updatedSkills);
      await dispatch('fetchAllData');
    }
  },
  modules: {}
});
