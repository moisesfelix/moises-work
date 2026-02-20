import { Request, Response } from 'express';
import { geminiService } from '../services/gemini.service';

class GeminiController {
  async generateArticle(req: Request, res: Response) {
    try {
      const articleRequest = req.body;
      if (!articleRequest.topic || !articleRequest.category) {
        return res.status(400).send({ error: 'Missing required fields: topic and category.' });
      }
      const article = await geminiService.generateArticle(articleRequest);
      return res.status(200).send(article);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        console.error('Error generating article:', errorMessage);
        return res.status(500).send({ error: 'Failed to generate article.', details: errorMessage });
    }
  }

  async generateTutorial(req: Request, res: Response) {
    try {
      const tutorialRequest = req.body;
      if (!tutorialRequest.topic || !tutorialRequest.category || !tutorialRequest.difficulty) {
        return res.status(400).send({ error: 'Missing required fields: topic, category, and difficulty.' });
      }
      const tutorial = await geminiService.generateTutorial(tutorialRequest);
      return res.status(200).send(tutorial);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        console.error('Error generating tutorial:', errorMessage);
        return res.status(500).send({ error: 'Failed to generate tutorial.', details: errorMessage });
    }
  }

  async analyzeSkills(req: Request, res: Response) {
    try {
        const data = req.body;
        if (!data.experiences || !data.projects || !data.articles || !data.tutorials) {
            return res.status(400).send({ error: 'Missing required data for analysis.' });
        }
        const skills = await geminiService.analyzeSkills(data);
        return res.status(200).send(skills);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        console.error('Error analyzing skills:', errorMessage);
        return res.status(500).send({ error: 'Failed to analyze skills.', details: errorMessage });
    }
  }

  async generateText(req: Request, res: Response) {
    try {
        const { prompt } = req.body;
        if (!prompt) return res.status(400).send({ error: 'Missing required field: prompt.' });
        const text = await geminiService.generateText(prompt);
        return res.status(200).send({ text });
    } catch (error: any) {
        console.error('Error generating text:', error);
        return res.status(500).send({ error: 'Failed to generate text.', details: error.message });
    }
  }

  async generateImage(req: Request, res: Response) {
    try {
        const { prompt } = req.body;
        if (!prompt) return res.status(400).send({ error: 'Missing required field: prompt.' });
        const imageBase64 = await geminiService.generateImage(prompt);
        return res.status(200).send({ imageBase64 });
    } catch (error: any) {
        console.error('Error generating image:', error);
        return res.status(500).send({ error: error.message });
    }
  }

  // NOVOS HANDLERS
  async generateRoadmap(req: Request, res: Response) {
    try {
      const { goal, currentRole, months } = req.body;
      if (!goal || !months) {
        return res.status(400).send({ error: 'Missing required fields: goal and months.' });
      }
      const roadmap = await geminiService.generateRoadmap({ goal, currentRole, months });
      return res.status(200).send(roadmap);
    } catch (error: any) {
      console.error('Error generating roadmap:', error);
      return res.status(500).send({ error: 'Failed to generate roadmap.', details: error.message });
    }
  }

  async generateProjectSuggestion(req: Request, res: Response) {
    try {
      const { technologies, level } = req.body;
      if (!technologies || !Array.isArray(technologies) || !level) {
        return res.status(400).send({ error: 'Missing required fields: technologies (array) and level.' });
      }
      const suggestion = await geminiService.generateProjectSuggestion(technologies, level);
      return res.status(200).send(suggestion);
    } catch (error: any) {
      console.error('Error generating project suggestion:', error);
      return res.status(500).send({ error: 'Failed to generate project suggestion.', details: error.message });
    }
  }

  async analyzeSoftSkills(req: Request, res: Response) {
    try {
      const { texts } = req.body;
      if (!texts || !Array.isArray(texts)) {
        return res.status(400).send({ error: 'Missing required field: texts (array).' });
      }
      const analysis = await geminiService.analyzeSoftSkills(texts);
      return res.status(200).send(analysis);
    } catch (error: any) {
      console.error('Error analyzing soft skills:', error);
      return res.status(500).send({ error: 'Failed to analyze soft skills.', details: error.message });
    }
  }
}

export const geminiController = new GeminiController();
