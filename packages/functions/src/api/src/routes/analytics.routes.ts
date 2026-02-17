import { Router } from 'express';
import { analyticsController } from '../controllers/analytics.controller';

const router = Router();

// GET /api/v1/analytics/:portfolioId
router.get('/:portfolioId', analyticsController.getAnalytics);

export const analyticsRoutes = router;
