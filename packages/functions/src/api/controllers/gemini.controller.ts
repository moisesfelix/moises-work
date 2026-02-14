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
        // Basic validation to ensure the payload has the expected arrays
        if (!data.experiences || !data.projects || !data.articles || !data.tutorials) {
            return res.status(400).send({ error: 'Missing required data for analysis. Please provide experiences, projects, articles, and tutorials.' });
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
        if (!prompt) {
            return res.status(400).send({ error: 'Missing required field: prompt.' });
        }

        const text = await geminiService.generateText(prompt);
        return res.status(200).send({ text });
    } catch (error: any) {
        console.error('FULL ERROR OBJECT:', JSON.stringify(error, null, 2));
        const errorMessage = error.message || 'An unknown error occurred';
        console.error('Error generating text:', errorMessage);
        return res.status(500).send({ error: 'Failed to generate text.', details: errorMessage });
    }
  }

  async generateImage(req: Request, res: Response) {
    try {
        const { prompt } = req.body;
        if (!prompt) {
            return res.status(400).send({ error: 'Missing required field: prompt.' });
        }

        // Returns a Base64 string
        const imageBase64 = await geminiService.generateImage(prompt);
        
        // Return JSON with base64 data
        // Frontend will decode to Blob/File
        return res.status(200).send({ imageBase64 });
    } catch (error: any) {
        console.error('Error generating image:', error);
        const errorMessage = error.message || 'Failed to generate image';
        return res.status(500).send({ error: errorMessage });
    }
  }
}

export const geminiController = new GeminiController();
