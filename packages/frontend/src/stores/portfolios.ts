import { defineStore } from 'pinia';
import type { Project, Article, Tutorial, Experience } from 'shared';
import { db } from '@/firebase/config';
import { ref, get, set, push, update, serverTimestamp } from 'firebase/database';
import { kebabCase } from '@/utils/slug';
import { useUiStore }   from './ui';
import { useAuthStore } from './auth';

interface PortfolioState {
  projects:          Project[];
  articles:          Article[];
  tutorials:         Tutorial[];
  skills:            any;
  experiences:       Experience[];
  about:             any;
  contact:           any;
  activePortfolioId: string | null;
}

export const usePortfoliosStore = defineStore('portfolios', {
  state: (): PortfolioState => ({
    projects:          [],
    articles:          [],
    tutorials:         [],
    skills:            {},
    experiences:       [],
    about:             null,
    contact:           null,
    activePortfolioId: null,
  }),

  getters: {
    getArticleBySlug:  (state) => (slug: string) => state.articles.find((a: any) => a.slug === slug),
    getTutorialBySlug: (state) => (slug: string) => state.tutorials.find((t: any) => t.slug === slug),
    getLatestArticles: (state) => (limit = 3) =>
      [...state.articles]
        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, limit),
  },

  actions: {
    setPortfolioData(payload: any) {
      this.projects    = payload.projects    || [];
      this.articles    = payload.articles    || [];
      this.tutorials   = payload.tutorials   || [];
      this.skills      = payload.skills      || {};
      this.experiences = payload.experiences || [];
      this.about       = payload.about       || null;
      this.contact     = payload.contact     || null;
    },

    async initializeUserPortfolio() {
      const ui   = useUiStore();
      const auth = useAuthStore();
      const uid  = auth.user?.uid;
      if (!uid) return;

      ui.setLoading(true);
      try {
        const snap = await get(ref(db, `users/${uid}/portfolios`));

        let portfolioId: string | null = null;
        let isNew = false;

        if (snap.exists()) {
          portfolioId = Object.keys(snap.val())[0];
        } else {
          isNew       = true;
          portfolioId = push(ref(db, 'portfolios_meta')).key!;
          const title     = auth.user.displayName || 'Meu Portfólio';
          const slugBase  = kebabCase(title);
          const uniqueSlug = `${slugBase}-${portfolioId.substring(portfolioId.length - 4)}`;

          const updates: Record<string, any> = {};
          updates[`/portfolios_meta/${portfolioId}`]    = { title, slug: uniqueSlug, ownerUid: uid, thumbnail: '', createdAt: serverTimestamp() };
          updates[`/portfolios_content/${portfolioId}`] = { about: { title: `Olá, sou ${title}`, description: 'Portfólio gerado automaticamente.' }, contact: { email: auth.user.email }, projects: [], articles: [], skills: {}, experiences: [] };
          updates[`/users/${uid}/portfolios/${portfolioId}`] = true;
          updates[`/slugs/${uniqueSlug}`] = portfolioId;
          await update(ref(db), updates);
        }

        this.activePortfolioId = portfolioId;
        const contentSnap = await get(ref(db, `portfolios_content/${portfolioId}`));
        if (contentSnap.exists()) this.setPortfolioData(contentSnap.val());

        return { isNew, portfolioId };
      } catch (error: any) {
        useUiStore().setError('Falha crítica ao inicializar portfólio: ' + error.message);
      } finally {
        ui.setLoading(false);
      }
    },

    async fetchPortfolioData(portfolioIdOrSlug?: string) {
      const ui = useUiStore();
      ui.setLoading(true);
      try {
        let targetId = portfolioIdOrSlug || this.activePortfolioId;
        if (!targetId) { ui.setLoading(false); return; }

        const slugSnap = await get(ref(db, `slugs/${targetId}`));
        const actualId = slugSnap.exists() ? slugSnap.val() : targetId;

        const contentSnap = await get(ref(db, `portfolios_content/${actualId}`));
        if (contentSnap.exists()) {
          this.setPortfolioData(contentSnap.val());
          this.activePortfolioId = actualId;
        } else {
          const directSnap = await get(ref(db, `portfolios_content/${targetId}`));
          if (directSnap.exists()) {
            this.setPortfolioData(directSnap.val());
            this.activePortfolioId = targetId;
          } else {
            this.setPortfolioData({});
            this.activePortfolioId = null;
            throw new Error('Portfolio not found');
          }
        }
      } catch (error: any) {
        useUiStore().setError(error.message);
      } finally {
        ui.setLoading(false);
      }
    },

    async fetchData(type: string) {
      if (!this.activePortfolioId) return;
      const ui = useUiStore();
      ui.setLoading(true);
      ui.setError(null);
      try {
        const snap = await get(ref(db, `portfolios_content/${this.activePortfolioId}/${type}`));
        if (snap.exists()) (this as any)[type] = snap.val();
      } catch (error: any) {
        ui.setError(error.message);
      } finally {
        ui.setLoading(false);
      }
    },

    async saveData({ type, data }: { type: string; data: any }) {
      if (!this.activePortfolioId) throw new Error('Nenhum portfólio ativo.');
      const ui = useUiStore();
      ui.setLoading(true);
      ui.setError(null);
      try {
        await set(ref(db, `portfolios_content/${this.activePortfolioId}/${type}`), data);
        (this as any)[type] = data;
      } catch (error: any) {
        ui.setError(error.message);
        throw error;
      } finally {
        ui.setLoading(false);
      }
    },

    async deleteItem({ type, itemId }: { type: string; itemId: string }) {
      const ui = useUiStore();
      ui.setLoading(true);
      try {
        const list = (this as any)[type] as any[];
        if (Array.isArray(list)) {
          await this.saveData({ type, data: list.filter((item: any) => item.id !== itemId) });
        }
      } catch (error: any) {
        ui.setError(error.message);
      } finally {
        ui.setLoading(false);
      }
    },
  },
});
