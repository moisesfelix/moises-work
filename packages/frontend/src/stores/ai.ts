import { defineStore } from 'pinia';
import { apiGeminiService } from '@/services/api.gemini.service';
import { storageService }   from '@/services/storage.service';
import { useUiStore }         from './ui';
import { usePortfoliosStore } from './portfolios';

export const useAiStore = defineStore('ai', {
  actions: {
    async generateArticleWithAI(request: any) {
      const ui         = useUiStore();
      const portfolios = usePortfoliosStore();
      ui.setLoading(true);
      ui.setError(null);
      try {
        const generated  = await apiGeminiService.generateArticle(request);
        let imageUrl = 'https://via.placeholder.com/600x400';
        try {
          const urls = await storageService.uploadMultipleImages(
            [generated.makeImagePrompt], 'articles',
            (c: number, t: number) => console.log(`Uploading ${c}/${t}`)
          );
          imageUrl = urls[0];
        } catch (e) { console.error('Image upload failed:', e); }

        const article = {
          id:    Date.now().toString(),
          ...generated,
          image: imageUrl,
          date:  new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }),
        };

        await portfolios.saveData({ type: 'articles', data: [...portfolios.articles, article] });
        return article;
      } catch (error: any) {
        ui.setError(error.message);
        throw error;
      } finally {
        ui.setLoading(false);
      }
    },

    async generateTutorialWithAI(request: any) {
      const ui         = useUiStore();
      const portfolios = usePortfoliosStore();
      ui.setLoading(true);
      ui.setError(null);
      try {
        const generated = await apiGeminiService.generateTutorial(request);
        let imageUrl = '';
        if (generated.makeImagePrompt) {
          const urls = await storageService.uploadMultipleImages([generated.makeImagePrompt], 'tutorials');
          imageUrl = urls[0];
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
        throw error;
      } finally {
        ui.setLoading(false);
      }
    },
  },
});
