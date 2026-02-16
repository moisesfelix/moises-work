import { Router } from 'express';
import { linkController } from '../controllers/link.controller';

const router = Router();

// 1. Direct Share (Legacy/API)
// e.g. /share/abc-123/article/slug
router.get('/share/:portfolioId/article/:slug', linkController.getArticleShare);
router.get('/share/:portfolioId/tutorial/:slug', linkController.getTutorialShare);

// 2. Direct Rewrite (User-facing)
// e.g. /abc-123/artigo/slug
router.get('/:portfolioId/artigo/:slug', linkController.getArticleShare);
router.get('/:portfolioId/tutorial/:slug', linkController.getTutorialShare);

// 3. DEBUG ENDPOINT - Novo!
router.get('/debug/article/:portfolioId/:slug', linkController.debugArticle);

export const linkRoutes = router;