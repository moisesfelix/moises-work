import { defineStore } from 'pinia';
import type { Project, Article, Tutorial, Experience } from 'shared';
import { db } from '@/firebase/config';
import { ref, get, set, push, update, serverTimestamp } from 'firebase/database';
import { kebabCase } from '@/utils/slug';
import { useUiStore }   from './ui';
import { useAuthStore } from './auth';
import type { NexusSprintResult } from '@/services/nexus-sprint.service';

export interface Roadmap {
  id: string;
  title: string;
  overview: string;
  steps: Array<{
    id: string;
    title: string;
    description: string;
    topics: string[];
    learningObjectives?: string[];
    projectSuggestion?: string;
    prerequisites?: string[];
    estimatedHours: number;
    dependsOn?: string[];
    completed?: boolean;
    completedAt?: string;
    generatedArticleId?: string;
    generatedTutorialId?: string;
    generatedProjectId?: string;
    quiz?: {
      passed: boolean;
      score: number;
      attempts: number;
      lastAttemptDate?: string;
    };
    tags?: string[];
  }>;
  totalMonths: number;
  resources: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface SoftSkills {
  communication: number;
  teamwork: number;
  problemSolving: number;
  adaptability: number;
  leadership: number;
  lastAnalyzed?: string;
}

// Formato do skills no portfólio: { "Frontend": [{ name: "Vue.js", percent: 80 }], ... }
export type SkillsMap = Record<string, Array<{ name: string; percent: number }>>;

interface PortfolioState {
  projects:           Project[];
  articles:           Article[];
  tutorials:          Tutorial[];
  skills:             SkillsMap;
  experiences:        Experience[];
  about:              any;
  contact:            any;
  activePortfolioId:  string | null;
  activePortfolioSlug: string | null;
  userPortfolioSlug:  string | null;
  roadmap:            Roadmap | null;
  roadmaps:           Roadmap[];
  currentRoadmapId:   string | null;
  softSkills:         SoftSkills | null;
  nexusSprints:       NexusSprintResult[];
  currentNexusSprint: NexusSprintResult | null;
  dataLoaded:         boolean;
}

export const usePortfoliosStore = defineStore('portfolios', {
  state: (): PortfolioState => ({
    projects:           [],
    articles:           [],
    tutorials:          [],
    skills:             {},
    experiences:        [],
    about:              null,
    contact:            null,
    activePortfolioId:  null,
    activePortfolioSlug: null,
    userPortfolioSlug:  null,
    roadmap:            null,
    roadmaps:           [],
    currentRoadmapId:   null,
    softSkills:         null,
    nexusSprints:       [],
    currentNexusSprint: null,
    dataLoaded:         false,
  }),

  getters: {
    /**
     * Lista flat de nomes de skills derivada do objeto skills por categoria.
     * Ex.: { Frontend: [{ name: 'Vue.js', percent: 80 }] } → ['Vue.js']
     */
    userSkills: (state): string[] => {
      return Object.values(state.skills)
        .flat()
        .map((s: any) => s.name)
        .filter(Boolean);
    },

    currentRoadmap: (state) => {
      if (state.currentRoadmapId) {
        return state.roadmaps.find(r => r.id === state.currentRoadmapId) || state.roadmap;
      }
      return state.roadmap || (state.roadmaps.length > 0 ? state.roadmaps[0] : null);
    },

    getArticleBySlug:  (state) => (slug: string) => state.articles.find((a: any) => a.slug === slug),
    getTutorialBySlug: (state) => (slug: string) => state.tutorials.find((t: any) => t.slug === slug),
    getLatestArticles: (state) => (limit = 3) =>
      [...state.articles]
        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, limit),

    completedSteps: (state) => state.roadmap?.steps.filter(s => s.completed) || [],
    progressPercent: (state) => {
      if (!state.roadmap?.steps.length) return 0;
      const completed = state.roadmap.steps.filter(s => s.completed).length;
      return Math.round((completed / state.roadmap.steps.length) * 100);
    },
  },

  actions: {
    setPortfolioData(payload: any) {
      this.projects    = payload.projects    || [];
      this.articles    = payload.articles    || [];
      this.tutorials   = payload.tutorials   || [];
      this.skills      = payload.skills      || {};   // SkillsMap — fonte da verdade
      this.experiences = payload.experiences || [];
      this.about       = payload.about       || null;
      this.contact     = payload.contact     || null;
      this.roadmap     = payload.roadmap     || null;
      this.nexusSprints = payload.nexusSprints || [];
      this.softSkills  = payload.softSkills  || null;

      if (payload.roadmaps && Array.isArray(payload.roadmaps)) {
        this.roadmaps = payload.roadmaps;
      } else if (payload.roadmap) {
        this.roadmaps = [payload.roadmap];
      } else {
        this.roadmaps = [];
      }

      this.dataLoaded = true;
    },

    async initializeUserPortfolio(setActive: boolean = true) {
      const ui   = useUiStore();
      const auth = useAuthStore();
      const uid  = auth.user?.uid;
      if (!uid) return;
      ui.setLoading(true);
      try {
        const snap = await get(ref(db, `users/${uid}/portfolios`));
        let portfolioId: string | null = null;
        let isNew = false;
        let uniqueSlug = '';

        if (snap.exists()) {
          portfolioId = Object.keys(snap.val())[0];
          const metaSnap = await get(ref(db, `portfolios_meta/${portfolioId}`));
          if (metaSnap.exists()) {
            uniqueSlug = metaSnap.val().slug;
          }
        } else {
          isNew       = true;
          portfolioId = push(ref(db, 'portfolios_meta')).key!;
          const title    = auth.user?.displayName || 'Meu Portfólio';
          const slugBase = kebabCase(title);
          uniqueSlug = `${slugBase}-${portfolioId.substring(portfolioId.length - 4)}`;

          const updates: Record<string, any> = {};
          updates[`/portfolios_meta/${portfolioId}`]    = { title, slug: uniqueSlug, ownerUid: uid, thumbnail: '', createdAt: serverTimestamp() };
          updates[`/portfolios_content/${portfolioId}`] = { about: { title: `Olá, sou ${title}`, description: 'Portfólio gerado automaticamente.' }, contact: { email: auth.user?.email }, projects: [], articles: [], skills: {}, experiences: [], roadmap: null, softSkills: null, nexusSprints: [] };
          updates[`/users/${uid}/portfolios/${portfolioId}`] = true;
          updates[`/slugs/${uniqueSlug}`] = portfolioId;

          await update(ref(db), updates);
        }

        if (uniqueSlug) {
          this.userPortfolioSlug = uniqueSlug;
          localStorage.setItem('userSlug', uniqueSlug);
        }

        if (setActive) {
          this.activePortfolioId   = portfolioId;
          this.activePortfolioSlug = uniqueSlug;

          const contentSnap = await get(ref(db, `portfolios_content/${portfolioId}`));
          if (contentSnap.exists()) {
            this.setPortfolioData(contentSnap.val());
          }
        }

        return { isNew, portfolioId, slug: uniqueSlug };
      } catch (error: any) {
        console.error('Initialize Error:', error);
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
        if (slugSnap.exists()) {
          this.activePortfolioSlug = targetId as string;
        }

        const contentSnap = await get(ref(db, `portfolios_content/${actualId}`));
        if (contentSnap.exists()) {
          this.setPortfolioData(contentSnap.val());
          this.activePortfolioId = actualId;
          if (!this.activePortfolioSlug) {
            const metaSnap = await get(ref(db, `portfolios_meta/${actualId}`));
            if (metaSnap.exists()) {
              this.activePortfolioSlug = metaSnap.val().slug;
            }
          }
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

    /**
     * Adiciona uma skill ao portfólio na categoria "Other" caso ela não exista.
     * A fonte da verdade é skills (SkillsMap), não userSkills.
     */
    async addUserSkill(skillName: string, category = 'Other', percent = 50) {
      if (!this.activePortfolioId) return;

      // Verifica se já existe em qualquer categoria
      const alreadyExists = Object.values(this.skills)
        .flat()
        .some((s: any) => s.name.toLowerCase() === skillName.toLowerCase());

      if (alreadyExists) return;

      const updatedSkills: SkillsMap = { ...this.skills };
      if (!updatedSkills[category]) {
        updatedSkills[category] = [];
      }
      updatedSkills[category] = [...updatedSkills[category], { name: skillName, percent }];
      this.skills = updatedSkills;

      await set(ref(db, `portfolios_content/${this.activePortfolioId}/skills`), updatedSkills);
    },

    async saveRoadmap(roadmap: Roadmap) {
      if (!this.activePortfolioId) throw new Error('Nenhum portfólio ativo.');
      const ui = useUiStore();
      ui.setLoading(true);
      try {
        const cleanSteps = roadmap.steps.map(step => {
          const s: any = { ...step };
          Object.keys(s).forEach(key => s[key] === undefined && delete s[key]);
          return s;
        });
        const updatedRoadmap = { ...roadmap, steps: cleanSteps, updatedAt: new Date().toISOString() };

        const index = this.roadmaps.findIndex(r => r.id === roadmap.id);
        if (index !== -1) {
          this.roadmaps[index] = updatedRoadmap;
        } else {
          this.roadmaps.push(updatedRoadmap);
        }

        if (!this.currentRoadmapId) {
          this.currentRoadmapId = updatedRoadmap.id;
        }

        await update(ref(db, `portfolios_content/${this.activePortfolioId}`), {
          roadmaps: this.roadmaps,
          roadmap: updatedRoadmap,
        });
        this.roadmap = updatedRoadmap;
      } catch (error: any) {
        ui.setError(error.message);
        throw error;
      } finally {
        ui.setLoading(false);
      }
    },

    async updateStepCompletion(
      stepId: string,
      completed: boolean,
      meta: { articleId?: string; tutorialId?: string; projectId?: string; quizResult?: any } = {}
    ) {
      const current = this.currentRoadmap;
      if (!current) return;

      const updatedSteps = current.steps.map(step => {
        if (step.id !== stepId) return step;

        const updatedStep = { ...step };
        if (completed !== undefined) {
          updatedStep.completed = completed;
          if (completed) {
            updatedStep.completedAt = new Date().toISOString();
          } else {
            delete updatedStep.completedAt;
          }
        }
        
        if (meta.articleId) {
          updatedStep.generatedArticleId = meta.articleId;
        }
        if (meta.tutorialId) {
          updatedStep.generatedTutorialId = meta.tutorialId;
        }
        if (meta.projectId) {
          updatedStep.generatedProjectId = meta.projectId;
        }
        if (meta.quizResult) {
          updatedStep.quiz = meta.quizResult;
        }

        return updatedStep;
      });

      const updatedRoadmap = { ...current, steps: updatedSteps };
      await this.saveRoadmap(updatedRoadmap);
    },

    setCurrentRoadmapId(id: string) {
      this.currentRoadmapId = id;
    },

    setCurrentNexusSprint(sprint: NexusSprintResult | null) {
      this.currentNexusSprint = sprint;
    },

    async saveNexusSprint(sprint: NexusSprintResult): Promise<string> {
      if (!this.activePortfolioId) throw new Error('Nenhum portfólio ativo.');
      const ui = useUiStore();
      ui.setLoading(true);
      try {
        const newSprint = { ...sprint, id: Date.now().toString(), createdAt: new Date().toISOString() };
        const updatedSprints = [...this.nexusSprints, newSprint];
        await this.saveData({ type: 'nexusSprints', data: updatedSprints });
        this.nexusSprints = updatedSprints;
        return newSprint.id;
      } catch (error: any) {
        ui.setError(error.message);
        throw error;
      } finally {
        ui.setLoading(false);
      }
    },

    async saveSoftSkills(analysis: any) {
      if (!this.activePortfolioId) throw new Error('Nenhum portfólio ativo.');
      const ui = useUiStore();
      ui.setLoading(true);
      try {
        const softSkills = { ...analysis, lastAnalyzed: new Date().toISOString() };
        await set(ref(db, `portfolios_content/${this.activePortfolioId}/softSkills`), softSkills);
        this.softSkills = softSkills;
      } catch (error: any) {
        ui.setError(error.message);
        throw error;
      } finally {
        ui.setLoading(false);
      }
    },
  },
});