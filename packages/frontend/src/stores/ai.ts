import { defineStore } from 'pinia';
import { apiGeminiService } from '@/services/api.gemini.service';
import { storageService }   from '@/services/storage.service';
import { useUiStore }         from './ui';
import { usePortfoliosStore } from './portfolios';
import { useUserStore } from './user';

export const useAiStore = defineStore('ai', {
  actions: {
    async generateArticleWithAI(request: any) {
      const ui         = useUiStore();
      const portfolios = usePortfoliosStore();
      const user = useUserStore();
      ui.setLoading(true);
      ui.setError(null);
      try {
        // A validação de créditos agora é feita no Articles.vue usando o SDK
        // e no backend de forma atômica. Removemos a validação simplista aqui
        // que causava conflito com o plano diário.
        
        // if (user.credits < 2) { ... } // REMOVIDO

        const generated  = await apiGeminiService.generateArticle(request);
        
        let imageUrl = 'https://via.placeholder.com/600x400';
        try {
            // Tenta usar a imagem gerada se for uma URL válida, senão usa placeholder
            if (generated.makeImagePrompt && generated.makeImagePrompt.startsWith('http')) {
                imageUrl = generated.makeImagePrompt;
            } else {
                 // Aqui poderia chamar apiGeminiService.generateImage(generated.makeImagePrompt)
                 // mas por simplicidade e robustez imediata, usamos placeholder temático
                 imageUrl = `https://via.placeholder.com/800x400?text=${encodeURIComponent(generated.title)}`;
            }
        } catch (e) { 
            console.error('Image logic failed:', e); 
        }

        const article = {
          id:    Date.now().toString(),
          ...generated,
          image: imageUrl,
          date:  new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }),
        };

        const currentArticles = portfolios.articles || [];
        await portfolios.saveData({ type: 'articles', data: [...currentArticles, article] });
        
        // Debita créditos localmente (o backend já deve ter debitado se a API for integrada)
        // Se a API não debita, fazemos aqui:
        // user.credits -= 2; 

        return article;
      } catch (error: any) {
        ui.setError(error.message);
        // user.checkAuthError(error.message) 
        throw error;
      } finally {
        ui.setLoading(false);
      }
    },

    async generateTutorialWithAI(request: any) {
      const ui         = useUiStore();
      const portfolios = usePortfoliosStore();
      const user = useUserStore();
      ui.setLoading(true);
      ui.setError(null);
      try {
        const generated = await apiGeminiService.generateTutorial(request);
        let imageUrl = 'https://via.placeholder.com/600x400';
        try {
           if (generated.makeImagePrompt && generated.makeImagePrompt.startsWith('http')) {
              imageUrl = generated.makeImagePrompt;
           } else if (generated.makeImagePrompt) {
              // Tenta gerar a imagem real usando o prompt
              try {
                  const urls = await storageService.uploadMultipleImages([generated.makeImagePrompt], 'tutorials');
                  if (urls.length > 0) {
                      imageUrl = urls[0];
                  }
              } catch (imgError) {
                  console.error('Falha ao gerar imagem real, usando placeholder:', imgError);
                  imageUrl = `https://via.placeholder.com/800x400?text=${encodeURIComponent(generated.title)}`;
              }
           }
        } catch (e) {
            console.error('Image logic failed:', e);
        }

        const tutorial = {
          id:    Date.now().toString(),
          ...generated,
          image: imageUrl,
          date:  new Date().toISOString(),
        };

        await portfolios.saveData({ type: 'tutorials', data: [...portfolios.tutorials, tutorial] });
        return tutorial;
      } catch (error: any) {
        ui.setError(error.message);
        user.checkAuthError(error.message) // check if token is expired
        throw error;
      } finally {
        ui.setLoading(false);
      }
    },
    async generateRoadmapWithAI(request: any) {
      const ui = useUiStore();
      const portfolios = usePortfoliosStore();
      const user = useUserStore();
      ui.setLoading(true);
      ui.setError(null);
      try {
        const generated = await apiGeminiService.generateRoadmap(request);

        const roadmap = {
          id: Date.now().toString(),
          ...generated,
          date: new Date().toISOString(),
        };

        await portfolios.saveData({ type: 'roadmaps', data: [...portfolios.roadmaps, roadmap] });
        return roadmap;
      } catch (error: any) {
        ui.setError(error.message);
        user.checkAuthError(error.message) // check if token is expired
        throw error;
      } finally {
        ui.setLoading(false);
      }
    },
    async generateProjectSuggestionWithAI(request: any) {
      const ui = useUiStore();
      const portfolios = usePortfoliosStore();
      const user = useUserStore();
      ui.setLoading(true);
      ui.setError(null);
      try {
        const generated = await apiGeminiService.generateProjectSuggestion(request);

        const projectSuggestion = {
          id: Date.now().toString(),
          ...generated,
          date: new Date().toISOString(),
        };

        await portfolios.saveData({ type: 'projectSuggestions', data: [...portfolios.projectSuggestions, projectSuggestion] });
        return projectSuggestion;
      } catch (error: any) {
        ui.setError(error.message);
        user.checkAuthError(error.message) // check if token is expired
        throw error;
      } finally {
        ui.setLoading(false);
      }
    },
    async analyzeSoftSkillsWithAI(request: any) {
      const ui = useUiStore();
      const portfolios = usePortfoliosStore();
      const user = useUserStore();
      ui.setLoading(true);
      ui.setError(null);
      try {
        const generated = await apiGeminiService.analyzeSoftSkills(request);

        const softSkillsAnalysis = {
          id: Date.now().toString(),
          ...generated,
          date: new Date().toISOString(),
        };

        await portfolios.saveData({ type: 'softSkillsAnalysis', data: [...portfolios.softSkillsAnalysis, softSkillsAnalysis] });
        return softSkillsAnalysis;
      } catch (error: any) {
        ui.setError(error.message);
        user.checkAuthError(error.message) // check if token is expired
        throw error;
      } finally {
        ui.setLoading(false);
      }
    },
    async analyzeSkillsWithAI(request: any) {
      const ui = useUiStore();
      const portfolios = usePortfoliosStore();
      const user = useUserStore();
      ui.setLoading(true);
      ui.setError(null);
      try {
        const generated = await apiGeminiService.analyzeSkills(request);

        const skillsAnalysis = {
          id: Date.now().toString(),
          ...generated,
          date: new Date().toISOString(),
        };

        await portfolios.saveData({ type: 'skillsAnalysis', data: [...portfolios.skillsAnalysis, skillsAnalysis] });
        return skillsAnalysis;
      } catch (error: any) {
        ui.setError(error.message);
        user.checkAuthError(error.message) // check if token is expired
        throw error;
      } finally {
        ui.setLoading(false);
      }
    },

    // NOVO: analyzeGithubProject
    async analyzeGithubProjectWithAI(request: any) {
      const ui = useUiStore();
      const portfolios = usePortfoliosStore();
      const user = useUserStore();
      ui.setLoading(true);
      ui.setError(null);
      try {
        const generated = await apiGeminiService.analyzeGithubProject(request);

        const projectSuggestion = {
          id: Date.now().toString(),
          ...generated,
          date: new Date().toISOString(),
        };

        await portfolios.saveData({ type: 'projectSuggestions', data: [...portfolios.projectSuggestions, projectSuggestion] });
        return projectSuggestion;
      } catch (error: any) {
        ui.setError(error.message);
        user.checkAuthError(error.message) // check if token is expired
        throw error;
      } finally {
        ui.setLoading(false);
      }
    },
  },
});
