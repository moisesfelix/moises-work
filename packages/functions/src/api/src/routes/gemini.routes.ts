import { Router } from 'express';
import { geminiController } from '../controllers/gemini.controller';

const router = Router();

// Route to generate an article
router.post('/generate-article', geminiController.generateArticle);

// Route to generate a tutorial
router.post('/generate-tutorial', geminiController.generateTutorial);

// Route to analyze skills from portfolio data
router.post('/analyze-skills', geminiController.analyzeSkills);

// Route for generic text generation
router.post('/generate-text', geminiController.generateText);

// Route for image generation (Imagen 3)
router.post('/generate-image', geminiController.generateImage);

export const geminiRoutes = router;
