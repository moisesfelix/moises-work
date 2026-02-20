import { Router } from 'express';
import { geminiController } from '../controllers/gemini.controller';

const router = Router();

// Rotas existentes
router.post('/generate-article', geminiController.generateArticle);
router.post('/generate-tutorial', geminiController.generateTutorial);
router.post('/analyze-skills', geminiController.analyzeSkills);
router.post('/generate-text', geminiController.generateText);
router.post('/generate-image', geminiController.generateImage);

// NOVAS ROTAS
router.post('/generate-roadmap', geminiController.generateRoadmap);
router.post('/generate-project-suggestion', geminiController.generateProjectSuggestion);
router.post('/analyze-soft-skills', geminiController.analyzeSoftSkills);

export const geminiRoutes = router;
