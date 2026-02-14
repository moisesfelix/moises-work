import type { Module } from 'vuex';
import { apiGeminiService } from '@/services/api.gemini.service';
import { storageService } from '@/services/storage.service';
import type { Article } from 'shared';

const aiModule: Module<any, any> = {
  namespaced: true,
  actions: {
    async generateArticleWithAI({ dispatch, commit, rootState }, request) {
      commit('ui/setLoading', true, { root: true });
      commit('ui/setError', null, { root: true });

      try {
        const generatedArticle = await apiGeminiService.generateArticle(request);
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

        const currentArticles = rootState.portfolios.articles || [];
        const updatedArticles = [...currentArticles, articleData];
        await dispatch('portfolios/saveData', { type: 'articles', data: updatedArticles }, { root: true });

        return articleData;
      } catch (error: any) {
        commit('ui/setError', error.message, { root: true });
        throw error;
      } finally {
        commit('ui/setLoading', false, { root: true });
      }
    },

    async generateTutorialWithAI({ dispatch, commit, rootState }, request) {
      commit('ui/setLoading', true, { root: true });
      commit('ui/setError', null, { root: true });

      try {
        const generatedTutorial = await apiGeminiService.generateTutorial(request);
        let imageUrl = '';
        if (generatedTutorial.makeImagePrompt) {
          const urls = await storageService.uploadMultipleImages(
            [generatedTutorial.makeImagePrompt],
            'tutorials'
          );
          imageUrl = urls[0];
        }

        const tutorialData = {
          id: Date.now().toString(),
          ...generatedTutorial,
          image: imageUrl,
          date: new Date().toISOString()
        };

        // Access rootState
        const currentTutorials = rootState.portfolios.tutorials || [];
        const updatedTutorials = [...currentTutorials, tutorialData];
        await dispatch('portfolios/saveData', { type: 'tutorials', data: updatedTutorials }, { root: true });

        return tutorialData;
      } catch (error: any) {
        console.error("Erro na Store (Tutorial AI):", error);
        commit('ui/setError', error.message, { root: true });
        throw error;
      } finally {
        commit('ui/setLoading', false, { root: true });
      }
    },
  },
};

export default aiModule;