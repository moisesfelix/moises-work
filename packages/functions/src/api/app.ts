import * as express from 'express';
import * as cors from 'cors';
import { authenticate } from './src/middlewares/auth.middleware';
import { rateLimitMiddleware } from './src/middlewares/rateLimit.middleware';
import { geminiRoutes } from './src/routes/gemini.routes';
import { analyticsRoutes } from './src/routes/analytics.routes';

const app = express();

// Middlewares
app.use(cors({ origin: true }));
app.use(express.json());

// API Routes
// Risco 2 - Rate Limiting aplicado na rota do Gemini
app.use('/v1/gemini', authenticate, rateLimitMiddleware, geminiRoutes);
app.use('/v1/analytics', authenticate, analyticsRoutes);

// Simple health check
app.get('/health', (req, res) => {
  res.send('API is healthy!');
});

export default app;
