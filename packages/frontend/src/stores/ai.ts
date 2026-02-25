import { defineStore } from 'pinia';
import { apiGeminiService } from '@/services/api.gemini.service';
import { storageService }   from '@/services/storage.service';
import { useUiStore }         from './ui';
import { usePortfoliosStore } from './portfolios';
import { useUserStore } from './user';

export const useAiStore = defineStore('ai', {
  actions: {
    async generateArticleWithAI(request: any, extraData: any = {}) {
      const ui         = useUiStore();
      const portfolios = usePortfoliosStore();
      const user = useUserStore();
      ui.setLoading(true);
      ui.setError(null);
      try {
        const generated  = await apiGeminiService.generateArticle(request);
        
        let imageUrl = 'https://via.placeholder.com/600x400';
        try {
            if (generated.makeImagePrompt && generated.makeImagePrompt.startsWith('http')) {
                imageUrl = generated.makeImagePrompt;
            } else if (generated.makeImagePrompt) {
                 try {
                    const urls = await storageService.uploadMultipleImages([generated.makeImagePrompt], 'articles');
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

        const article = {
          id:    Date.now().toString(),
          ...generated,
          image: imageUrl,
          date:  new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }),
          ...extraData // Mescla dados extras (ex: tags do roadmap)
        };
        
        // Garante que tags sejam unidas se existirem em ambos
        if (extraData.tags && generated.tags) {
            article.tags = [...new Set([...generated.tags, ...extraData.tags])];
        }

        const currentArticles = portfolios.articles || [];
        await portfolios.saveData({ type: 'articles', data: [...currentArticles, article] });

        return article;
      } catch (error: any) {
        ui.setError(error.message);
        throw error;
      } finally {
        ui.setLoading(false);
      }
    },

    async generateTutorialWithAI(request: any, extraData: any = {}) {
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
          ...extraData
        };

        if (extraData.tags && generated.tags) {
            tutorial.tags = [...new Set([...generated.tags, ...extraData.tags])];
        }

        const currentTutorials = portfolios.tutorials || [];
        await portfolios.saveData({ type: 'tutorials', data: [...currentTutorials, tutorial] });
        return tutorial;
      } catch (error: any) {
        ui.setError(error.message);
        user.checkAuthError(error.message)
        throw error;
      } finally {
        ui.setLoading(false);
      }
    },

    async generateProjectFromTopicWithAI(request: any, extraData: any = {}) {
      const ui = useUiStore();
      const portfolios = usePortfoliosStore();
      const user = useUserStore();
      ui.setLoading(true);
      ui.setError(null);
      try {
        // Gera sugestão baseada em tecnologias/nível
        const generated = await apiGeminiService.generateProjectSuggestion(
            request.technologies, 
            request.level, 
            request.persona
        );

        let imageUrl = 'https://via.placeholder.com/600x400';
        const imagePrompt = `Capa de projeto de portfólio moderno para: ${generated.title}. Estilo minimalista, tecnológico, cores vibrantes.`;
        
        try {
             const urls = await storageService.uploadMultipleImages([imagePrompt], 'projects');
             if (urls.length > 0) {
                 imageUrl = urls[0];
             }
        } catch (imgError) {
             console.error('Falha ao gerar imagem do projeto:', imgError);
        }

        const project = {
          id: Date.now().toString(),
          title: generated.title,
          description: generated.description,
          image: imageUrl,
          tags: generated.technologies || [],
          category: 'Projeto de Aprendizado',
          githubUrl: '',
          ...extraData
        };

        if (extraData.tags && project.tags) {
            project.tags = [...new Set([...project.tags, ...extraData.tags])];
        }

        const currentProjects = portfolios.projects || [];
        await portfolios.saveData({ type: 'projects', data: [...currentProjects, project] });
        return project;
      } catch (error: any) {
        ui.setError(error.message);
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
    
    // NOVO: generateSocialPost
    async generateSocialPost(request: { 
        title: string, 
        description: string, 
        type: string, 
        network: string, 
        tone: string, 
        goal: string,
        url: string
    }) {
      const ui = useUiStore();
      ui.setLoading(true);
      try {
        const generated = await apiGeminiService.generateSocialPost(request);
        return generated.text;
      } catch (error: any) {
        ui.setError(error.message);
        throw error;
      } finally {
        ui.setLoading(false);
      }
    },
  },
});
