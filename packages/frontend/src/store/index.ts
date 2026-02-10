import { createStore, Store } from 'vuex';
import type { Project, Article, Tutorial, Experience } from 'shared';
import { db } from '@/firebase/config';
import { ref, get, set, remove } from 'firebase/database';
import { geminiService } from '@/services/gemini.service';
import { storageService } from '@/services/storage.service';
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';

// --- Interfaces ---

interface AuthState {
  user: any | null; // Use a proper type for your user object
}

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
  about: AboutState | null;
  contact: any;
  error: string | null;
  
  // Theme state
  theme: ThemeState;

  // Auth state
  auth: AuthState;
}

// --- Modules ---

const themeModule = {
  namespaced: true,
  state: (): ThemeState => ({
    currentTheme: (localStorage.getItem('theme') as 'light' | 'dark') || 'dark'
  }),
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
      const theme = (localStorage.getItem('theme') as 'light' | 'dark') || 'dark';
      commit('setTheme', theme);
      document.documentElement.className = theme + '-theme';
    }
  }
};

// --- Main Store ---

const store: Store<State> = createStore({
  state: {
    isLoading: false,
    projects: [],
    articles: [],
    tutorials: [],
    skills: {},
    experiences: [],
    about: null,
    contact: null,
    error: null,
    theme: { currentTheme: 'dark' }, // Initial dummy state, controlled by module
    auth: { user: null }
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
    },
    setLoading(state, isLoading: boolean) {
      state.isLoading = isLoading;
    },
    setError(state, error: string | null) {
      state.error = error;
    },
    setUser(state: State, user: any) {
      state.auth.user = user;
    },
    clearUser(state: State) {
      state.auth.user = null;
    }
  },

  actions: {
    // --- Public Actions ---
    async fetchPortfolioData({ commit }) {
      commit('setLoading', true);
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
        commit('setError', error.message);
      } finally {
        commit('setLoading', false);
      }
    },

    // --- Admin Actions ---
    
    async fetchAllData({ dispatch }) {
      // Re-use fetchPortfolioData for admin as well since it fetches everything
      await dispatch('fetchPortfolioData');
    },

    async saveData({ dispatch, commit }, { type, data }) {
      commit('setLoading', true);
      commit('setError', null);

      try {
        const dataPath = `/${type}`;
        await set(ref(db, dataPath), data);
        await dispatch('fetchPortfolioData');
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
        await dispatch('fetchPortfolioData');
      } catch (error: any) {
        commit('setError', error.message);
        throw error;
      } finally {
        commit('setLoading', false);
      }
    },

    // --- Authentication Actions ---
    async login({ commit }, { email, password }) {
      commit('setLoading', true);
      commit('setError', null);

      try {
        const auth = getAuth();
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        commit('setUser', user);
        return user; // Return the user for use in the component
      } catch (error: any) {
        commit('setError', error.message);
        throw error; // Re-throw the error for the component to handle
      } finally {
        commit('setLoading', false);
      }
    },

    async logout({ commit }) {
      commit('setLoading', true);
      try {
        const auth = getAuth();
        await signOut(auth);
        commit('clearUser');
      } catch (error: any) {
        commit('setError', error.message);
        throw error;
      } finally {
        commit('setLoading', false);
      }
    },

    // Specific AI Actions
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
        // We need to handle if state.articles is undefined/null
        const currentArticles = state.articles || [];
        const updatedArticles = [...currentArticles, articleData];
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
      commit('setError', null);

      try {
        // 1. Gera o conteúdo do tutorial (JSON + Texto)
        const generatedTutorial = await geminiService.generateTutorial(request);

        // 2. Gera a imagem
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
        const currentTutorials = state.tutorials || [];
        const updatedTutorials = [...currentTutorials, tutorialData];
        await dispatch('saveData', { type: 'tutorials', data: updatedTutorials });

        return tutorialData;
      } catch (error: any) {
        console.error("Erro na Store (Tutorial AI):", error);
        commit('setError', error.message);
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
        // We find the article and remove it from the list, then save the list.
        // Alternatively, we could delete by ID if we knew the path structure perfectly.
        // Saving the filtered list is safer if the ID is just a property, not a key.
        const currentArticles = state.articles || [];
        const updatedArticles = currentArticles.filter(a => a.id !== article.id);
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
        const currentTutorials = state.tutorials || [];
        const updatedTutorials = currentTutorials.filter(t => t.id !== tutorial.id);
        await dispatch('saveData', { type: 'tutorials', data: updatedTutorials });
      } catch (error: any) {
        commit('setError', error.message);
        throw error;
      } finally {
        commit('setLoading', false);
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
    isAuthenticated: (state) => !!state.auth.user,
    currentUser: (state) => state.auth.user,
  }
});

export default store;
