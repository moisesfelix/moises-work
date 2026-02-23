import { Router } from 'express';
import { geminiController } from '../controllers/gemini.controller';
//import { rateLimitMiddleware } from '../middlewares/rateLimit.middleware'; // REMOVE

const router = Router();

router.post('/generate-article', geminiController.generateArticle);
router.post('/generate-tutorial', geminiController.generateTutorial);
router.post('/generate-roadmap', geminiController.generateRoadmap);
router.post('/generate-project-suggestion', geminiController.generateProjectSuggestion);
router.post('/analyze-soft-skills', geminiController.analyzeSoftSkills);
router.post('/analyze-skills', geminiController.analyzeSkills);
router.post('/analyze-github-project', geminiController.analyzeGithubProject); // NOVO
router.post('/generate-text', geminiController.generateText);
router.post('/generate-image', geminiController.generateImage);

export const geminiRoutes = router;
