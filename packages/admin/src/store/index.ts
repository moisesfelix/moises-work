import { createStore } from 'vuex';
import { db } from '@/firebase/config';
import { ref, set, get, remove } from 'firebase/database';
import { geminiService } from '@/services/gemini.service';
import { storageService } from '@/services/storage.service';

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  image: string;
  date: string;
  readTime: string;
  codeBlocks?: Array<{
    language: string;
    code: string;
  }>;
}

export interface Tutorial {
  id: string;
  title: string;
  slug: string;
  category: string;
  difficulty: string;
  duration: string;
  excerpt: string;
  image: string;
  steps: Array<{
    title: string;
    content: string;
    code?: string;
  }>;
}

export interface About {
  title: string;
  description: string;
  image: string;
}

interface State {
  projects: any[];
  articles: Article[];
  tutorials: Tutorial[];
  skills: any;
  experiences: any[];
  about: About | null;
  contact: any;
  loading: boolean;
  error: string | null;
}

export default createStore<State>({
  state: {
    projects: [],
    articles: [],
    tutorials: [],
    skills: {},
    experiences: [],
    about: null,
    contact: null,
    loading: false,
    error: null,
  },

  mutations: {
    setPortfolioData(state, data) {
      state.projects = data.projects || [];
      state.articles = data.articles || [];
      state.tutorials = data.tutorials || [];
      state.skills = data.skills || {};
      state.experiences = data.experiences || [];
      state.about = data.about || null;
      state.contact = data.contact || null;
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

    setLoading(state, loading: boolean) {
      state.loading = loading;
    },

    setError(state, error: string | null) {
      state.error = error;
    },
  },

  actions: {
    async fetchAllData({ commit }) {
      commit('setLoading', true);
      commit('setError', null);

      try {
        const dbRef = ref(db, '/');
        const snapshot = await get(dbRef);

        if (snapshot.exists()) {
          const data = snapshot.val();
          commit('setPortfolioData', data);
        } else {
          commit('setPortfolioData', {
            projects: [],
            articles: [],
            tutorials: [],
            skills: {},
            experiences: [],
            about: null,
          });
        }
      } catch (error: any) {
        commit('setError', error.message);
        console.error('Error fetching data:', error);
      } finally {
        commit('setLoading', false);
      }
    },

    async fetchData({ commit }, type: string) {
      commit('setLoading', true);
      commit('setError', null);

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
        commit('setError', error.message);
        console.error(`Error fetching ${type}:`, error);
      } finally {
        commit('setLoading', false);
      }
    },

    async saveData({ dispatch, commit }, { type, data }) {
      commit('setLoading', true);
      commit('setError', null);

      try {
        const dataPath = `/${type}`;
        await set(ref(db, dataPath), data);
        await dispatch('fetchAllData');
      } catch (error: any) {
        commit('setError', error.message);
        throw error;
      } finally {
        commit('setLoading', false);
      }
    },

    async deleteData({ dispatch, commit }, { type, id }) {
      commit('setLoading', true);
      commit('setError', null);

      try {
        const dataPath = `/${type}/${id}`;
        await remove(ref(db, dataPath));
        await dispatch('fetchAllData');
      } catch (error: any) {
        commit('setError', error.message);
        throw error;
      } finally {
        commit('setLoading', false);
      }
    },

    async generateArticleWithAI({ state, dispatch, commit }, request) {
      commit('setLoading', true);
      commit('setError', null);

      try {
        // Step 1: Generate article content
        const generatedArticle = await geminiService.generateArticle(request);

        // Step 2: Generate and upload image
        let imageUrl = 'https://via.placeholder.com/600x400';
        try {
          const imagePrompts = [generatedArticle.makeImagePrompt];
          const urls = await storageService.uploadMultipleImages(
            imagePrompts,
            'articles',
            (current, total) => {
              console.log(`Uploading image ${current}/${total}`);
            }
          );
          imageUrl = urls[0];
        } catch (imageError) {
          console.error('Failed to generate/upload image:', imageError);
        }

        // Step 3: Prepare article data
        const articleData: Article = {
          id: Date.now().toString(),
          ...generatedArticle,
          image: imageUrl,
          date: new Date().toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          }),
        };

        // Step 4: Save to database
        const updatedArticles = [...state.articles, articleData];
        await dispatch('saveData', { type: 'articles', data: updatedArticles });

        return articleData;
      } catch (error: any) {
        commit('setError', error.message);
        throw error;
      } finally {
        commit('setLoading', false);
      }
    },

    async generateTutorialWithAI({ state, dispatch, commit }, request) {
      commit('setLoading', true);

      try {
        // 1. Gera o conteúdo do tutorial (JSON + Texto)
        const generatedTutorial = await geminiService.generateTutorial(request);

        // 2. Gera a imagem (Chama o storageService que agora usa Pollinations/Gemini)
        let imageUrl = '';
        if (generatedTutorial.makeImagePrompt) {
          const urls = await storageService.uploadMultipleImages(
            [generatedTutorial.makeImagePrompt],
            'tutorials'
          );
          imageUrl = urls[0];
        }

        // 3. Monta o objeto final
        const tutorialData = {
          id: Date.now().toString(),
          ...generatedTutorial,
          image: imageUrl,
          date: new Date().toISOString()
        };

        // 4. Salva no estado/banco
        const updatedTutorials = [...state.tutorials, tutorialData];
        await dispatch('saveData', { type: 'tutorials', data: updatedTutorials });

        return tutorialData;
      } catch (error) {
        console.error("Erro na Store (Tutorial AI):", error);
        throw error;
      } finally {
        commit('setLoading', false);
      }
    },

    async deleteArticleWithImage({ state, dispatch, commit }, article: Article) {
      commit('setLoading', true);
      commit('setError', null);

      try {
        // Step 1: Delete image from storage
        if (article.image) {
          await storageService.deleteImage(article.image);
        }

        // Step 2: Delete from database
        const updatedArticles = state.articles.filter(a => a.id !== article.id);
        await dispatch('saveData', { type: 'articles', data: updatedArticles });
      } catch (error: any) {
        commit('setError', error.message);
        throw error;
      } finally {
        commit('setLoading', false);
      }
    },

    async deleteTutorialWithImage({ state, dispatch, commit }, tutorial: Tutorial) {
      commit('setLoading', true);
      commit('setError', null);

      try {
        // Step 1: Delete image from storage
        if (tutorial.image) {
          await storageService.deleteImage(tutorial.image);
        }

        // Step 2: Delete from database
        const updatedTutorials = state.tutorials.filter(t => t.id !== tutorial.id);
        await dispatch('saveData', { type: 'tutorials', data: updatedTutorials });
      } catch (error: any) {
        commit('setError', error.message);
        throw error;
      } finally {
        commit('setLoading', false);
      }
    },

    async saveSkill({ dispatch, state, commit }, { name, value, oldName }) {
      commit('setLoading', true);
      commit('setError', null);

      try {
        const skillsRef = ref(db, 'skills');
        let updatedSkills = { ...state.skills };

        if (oldName && oldName !== name) {
          delete updatedSkills[oldName];
        }

        updatedSkills[name] = value;
        await set(skillsRef, updatedSkills);
        await dispatch('fetchAllData');
      } catch (error: any) {
        commit('setError', error.message);
        throw error;
      } finally {
        commit('setLoading', false);
      }
    },

    async deleteSkill({ dispatch, state, commit }, name) {
      commit('setLoading', true);
      commit('setError', null);

      try {
        const skillsRef = ref(db, 'skills');
        let updatedSkills = { ...state.skills };
        delete updatedSkills[name];
        await set(skillsRef, updatedSkills);
        await dispatch('fetchAllData');
      } catch (error: any) {
        commit('setError', error.message);
        throw error;
      } finally {
        commit('setLoading', false);
      }
    },
  },
});
