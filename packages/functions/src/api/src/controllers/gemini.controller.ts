import { Request, Response } from 'express';
import { geminiService } from '../services/gemini.service';

class GeminiController {
  async generateArticle(req: Request, res: Response) {
    try {
      const uid = req.user?.uid;
      if (!uid) return res.status(401).json({ error: 'Não autenticado' });
      const result = await geminiService.generateArticle(req.body);
      return res.json(result);
    } catch (error: any) {
      console.error('generateArticle error:', error);
      return res.status(500).json({ error: 'Falha ao gerar artigo', details: error.message });
    }
  }

  async generateTutorial(req: Request, res: Response) {
    try {
      const uid = req.user?.uid;
      if (!uid) return res.status(401).json({ error: 'Não autenticado' });
      const result = await geminiService.generateTutorial(req.body);
      return res.json(result);
    } catch (error: any) {
      console.error('generateTutorial error:', error);
      return res.status(500).json({ error: 'Falha ao gerar tutorial', details: error.message });
    }
  }

  async generateRoadmap(req: Request, res: Response) {
    try {
      const uid = req.user?.uid;
      if (!uid) return res.status(401).json({ error: 'Não autenticado' });
      const result = await geminiService.generateRoadmap(req.body);
      return res.json(result);
    } catch (error: any) {
      console.error('generateRoadmap error:', error);
      return res.status(500).json({ error: 'Falha ao gerar roadmap', details: error.message });
    }
  }

  async generateProjectSuggestion(req: Request, res: Response) {
    try {
      const uid = req.user?.uid;
      if (!uid) return res.status(401).json({ error: 'Não autenticado' });
      const result = await geminiService.generateProjectSuggestion(req.body);
      return res.json(result);
    } catch (error: any) {
      console.error('generateProjectSuggestion error:', error);
      return res.status(500).json({ error: 'Falha ao sugerir projeto', details: error.message });
    }
  }

  async analyzeSoftSkills(req: Request, res: Response) {
    try {
      const uid = req.user?.uid;
      if (!uid) return res.status(401).json({ error: 'Não autenticado' });
      const result = await geminiService.analyzeSoftSkills(req.body);
      return res.json(result);
    } catch (error: any) {
      console.error('analyzeSoftSkills error:', error);
      return res.status(500).json({ error: 'Falha na análise de soft skills', details: error.message });
    }
  }

  // NOVO: analyzeSkills
  async analyzeSkills(req: Request, res: Response) {
    try {
      const uid = req.user?.uid;
      if (!uid) return res.status(401).json({ error: 'Não autenticado' });
      const result = await geminiService.analyzeSkills(req.body);
      return res.json(result);
    } catch (error: any) {
      console.error('analyzeSkills error:', error);
      return res.status(500).json({ error: 'Falha na análise de habilidades', details: error.message });
    }
  }

  async generateText(req: Request, res: Response) {
    try {
      const { prompt } = req.body;
      if (!prompt) return res.status(400).json({ error: 'Missing prompt' });
      const text = await geminiService.generateText(prompt);
      return res.json({ text });
    } catch (error: any) {
      console.error('generateText error:', error);
      return res.status(500).json({ error: 'Falha ao gerar texto', details: error.message });
    }
  }

  async generateImage(req: Request, res: Response) {
    try {
      const { prompt } = req.body;
      if (!prompt) return res.status(400).json({ error: 'Missing prompt' });
      const imageBase64 = await geminiService.generateImage(prompt);
      return res.json({ imageBase64 });
    } catch (error: any) {
      console.error('generateImage error:', error);
      return res.status(500).json({ error: 'Falha ao gerar imagem', details: error.message });
    }
  }
}

export const geminiController = new GeminiController();
