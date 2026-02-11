
import type { Module } from 'vuex';
import type { Project, Article, Tutorial, Experience } from 'shared';
import { db } from '@/firebase/config';
import { ref, get, set, remove, push, serverTimestamp, update } from 'firebase/database';
import { kebabCase } from '@/utils/slug';

interface PortfolioState {
  // Data for the currently active/viewed portfolio
  projects: Project[];
  articles: Article[];
  tutorials: Tutorial[];
  skills: any;
  experiences: Experience[];
  about: any;
  contact: any;
  
  // ID of the currently loaded portfolio
  activePortfolioId: string | null;
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
    activePortfolioId: null,
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
    setActivePortfolioId(state, id) {
      state.activePortfolioId = id;
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
    /**
     * Inicializa o portfólio do usuário com consistência ATÔMICA.
     * Ou grava tudo (Meta, Content, Slug, UserLink), ou não grava nada.
     */
    async initializeUserPortfolio({ commit, rootState }) {
        const uid = rootState.auth.user?.uid;
        if (!uid) return;

        commit('ui/setLoading', true, { root: true });
        
        try {
            // 1. Verifica se já existe (Leitura rápida no índice do usuário)
            const userPortfoliosRef = ref(db, `users/${uid}/portfolios`);
            const snapshot = await get(userPortfoliosRef);
            
            let portfolioId: string | null = null;
            let isNew = false;

            if (snapshot.exists()) {
                // Usuário já tem portfólio, pega o primeiro ID
                portfolioId = Object.keys(snapshot.val())[0];
            } else {
                // --- CRIAÇÃO DO ZERO (ATOMIC WAY) ---
                isNew = true;
                
                // A. Gera o ID no cliente (sem ir ao banco ainda)
                portfolioId = push(ref(db, 'portfolios_meta')).key!;
                
                // B. Prepara dados auxiliares
                const title = rootState.auth.user.displayName || "Meu Portfólio";
                const slugBase = kebabCase(title);
                // Adiciona sufixo aleatório para garantir unicidade do slug sem leitura prévia pesada
                const uniqueSlug = `${slugBase}-${portfolioId.substring(portfolioId.length - 4)}`;

                // C. O PACOTE ATÔMICO (O segredo do Sênior)
                const updates: Record<string, any> = {};

                // 1. Tabela de Metadados (Leitura rápida p/ Dashboard)
                updates[`/portfolios_meta/${portfolioId}`] = {
                    title: title,
                    slug: uniqueSlug,
                    ownerUid: uid,
                    thumbnail: "",
                    createdAt: serverTimestamp()
                };

                // 2. Tabela de Conteúdo (Dados pesados, lazy loaded)
                updates[`/portfolios_content/${portfolioId}`] = {
                    about: { 
                        title: `Olá, sou ${title}`, 
                        description: 'Este portfólio foi gerado automaticamente com arquitetura escalável.' 
                    },
                    contact: { email: rootState.auth.user.email },
                    projects: [],
                    articles: [],
                    skills: {},
                    experiences: []
                };

                // 3. Índice Invertido (User -> Portfolios)
                updates[`/users/${uid}/portfolios/${portfolioId}`] = true;

                // 4. DNS Interno (Slug -> ID)
                updates[`/slugs/${uniqueSlug}`] = portfolioId;

                // D. DISPARO ÚNICO
                // Se a internet cair aqui, o Firebase garante integridade.
                await update(ref(db), updates);
            }

            // Define como ativo na sessão
            commit('setActivePortfolioId', portfolioId);
            
            // Busca o conteúdo atualizado para mostrar na tela
            // (Poderíamos otimizar usando o objeto local se isNew=true, mas fetch garante sync)
            const contentRef = ref(db, `portfolios_content/${portfolioId}`);
            const contentSnap = await get(contentRef);
            
            if (contentSnap.exists()) {
                commit('setPortfolioData', contentSnap.val());
            }

            return { isNew, portfolioId };

        } catch (error: any) {
            console.error("Critical Error initializing portfolio:", error);
            commit('ui/setError', "Falha crítica ao criar ambiente: " + error.message, { root: true });
        } finally {
            commit('ui/setLoading', false, { root: true });
        }
    },

    /**
     * Fetches portfolio data.
     * If an ID/Slug is provided, fetches that specific one.
     */
    async fetchPortfolioData({ commit, state }, portfolioIdOrSlug?: string) {
      // If we already have content loaded for this slug/id, we might skip re-fetching
      // But for now, let's always fetch to ensure freshness or handle navigation
      
      commit('ui/setLoading', true, { root: true });
      try {
        let targetId = portfolioIdOrSlug || state.activePortfolioId;
        
        // If it looks like a slug (no ID format logic here, but assuming context), resolve it
        // Or if we don't have a targetId, try to fallback (e.g. for public home)
        if (!targetId) {
             // If no target ID provided (e.g. landing page?), we might not want to load anything
             // Or we load a "featured" one?
             // For now, let's just return if no target is specified
             commit('ui/setLoading', false, { root: true });
             return;
        }

        // Try to resolve slug first
        const slugRef = ref(db, `slugs/${targetId}`);
        const slugSnap = await get(slugRef);
        
        let actualId = targetId;
        if (slugSnap.exists()) {
            actualId = slugSnap.val();
        }
        
        // Now fetch content using ID
        const contentRef = ref(db, `portfolios_content/${actualId}`);
        const contentSnap = await get(contentRef);
        
        if (contentSnap.exists()) {
            commit('setPortfolioData', contentSnap.val());
            commit('setActivePortfolioId', actualId);
        } else {
             // Try fetching as if targetId WAS the ID directly (if slug check failed but maybe it is an ID?)
             // This is redundant if targetId was already an ID and not in slugs table, but good for safety if slugs table is partial
             const contentRefDirect = ref(db, `portfolios_content/${targetId}`);
             const contentSnapDirect = await get(contentRefDirect);
             if (contentSnapDirect.exists()) {
                 commit('setPortfolioData', contentSnapDirect.val());
                 commit('setActivePortfolioId', targetId);
             } else {
                 // Portfolio not found or empty
                 console.warn("Portfolio content not found for:", targetId);
                 // If not found, clear data so we don't show previous portfolio info
                 commit('setPortfolioData', {});
                 commit('setActivePortfolioId', null); // Reset active ID to indicate nothing valid loaded
                 // Optionally: throw error to be caught by UI
                 throw new Error("Portfolio not found");
             }
        }

      } catch (error: any) {
        console.error("Firebase fetch error:", error);
        commit('ui/setError', error.message, { root: true });
      } finally {
        commit('ui/setLoading', false, { root: true });
      }
    },

    async fetchData({ commit, state }, type: string) {
      if (!state.activePortfolioId) return;
      
      commit('ui/setLoading', true, { root: true });
      commit('ui/setError', null, { root: true });

      try {
        const dbRef = ref(db, `portfolios_content/${state.activePortfolioId}/${type}`);
        const snapshot = await get(dbRef);

        if (snapshot.exists()) {
          const data = snapshot.val();
          const mutation = `set${type.charAt(0).toUpperCase() + type.slice(1)}`;
          commit(mutation, data);
        }
      } catch (error: any) {
        commit('ui/setError', error.message, { root: true });
        console.error(`Error fetching ${type}:`, error);
      } finally {
        commit('ui/setLoading', false, { root: true });
      }
    },

    async saveData({ dispatch, commit, state }, { type, data }) {
      if (!state.activePortfolioId) {
          throw new Error("No active portfolio to save to.");
      }

      commit('ui/setLoading', true, { root: true });
      commit('ui/setError', null, { root: true });

      try {
        const dataPath = `portfolios_content/${state.activePortfolioId}/${type}`;
        await set(ref(db, dataPath), data);
        // Update local state
        const mutation = `set${type.charAt(0).toUpperCase() + type.slice(1)}`;
        commit(mutation, data);
      } catch (error: any) {
        commit('ui/setError', error.message, { root: true });
        throw error;
      } finally {
        commit('ui/setLoading', false, { root: true });
      }
    },

    async deleteData({ dispatch, commit, state }, { type, id }) {
        // Not implemented for array/object specific logic here, 
        // relying on specific actions or saveData with full list
        console.warn("deleteData generic action called but might be incomplete for new structure.");
    },
    
    // Refined delete actions for arrays
    async deleteArticleWithImage({ state, dispatch, commit }, article: Article) {
        commit('ui/setLoading', true, { root: true });
        try {
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
        try {
          const currentTutorials = state.tutorials || [];
          const updatedTutorials = currentTutorials.filter(t => t.id !== tutorial.id);
          await dispatch('saveData', { type: 'tutorials', data: updatedTutorials });
        } catch (error: any) {
          commit('ui/setError', error.message, { root: true });
          throw error;
        } finally {
          commit('ui/setLoading', false, { root: true });
        }
      },

      // Generic delete for projects/experiences which are arrays
      async deleteItem({ state, dispatch, commit }, { type, itemId }) {
          commit('ui/setLoading', true, { root: true });
          try {
              // @ts-ignore
              const currentList = state[type] as any[];
              if (Array.isArray(currentList)) {
                  const updatedList = currentList.filter(item => item.id !== itemId);
                  await dispatch('saveData', { type, data: updatedList });
              }
          } catch (error: any) {
              commit('ui/setError', error.message, { root: true });
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
    // --- Global/Feed Getters ---
    
    // Getter to fetch ALL recent articles from ALL portfolios (for landing page feed)
    // NOTE: This requires fetching all portfolios content, which might be heavy.
    // Ideally, we should have a separate 'articles_feed' or similar in DB.
    // For now, let's assume we might implement a specific action to fetch this, 
    // or just return empty if we don't have a global state for it.
    
    // Since this getter is synchronous, it can't fetch data. 
    // We need a new state property `globalArticles` and an action `fetchGlobalFeed`.
  }
};

export default portfoliosModule;
