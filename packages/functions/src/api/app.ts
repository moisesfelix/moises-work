import * as express from 'express';
import * as cors from 'cors';
import { authenticate } from './src/middlewares/auth.middleware';
import { geminiRoutes } from './src/routes/gemini.routes';

const app = express();

// Middlewares
app.use(cors({ origin: true }));
app.use(express.json());

// API Routes
app.use('/v1/gemini', authenticate, geminiRoutes);

// Simple health check
app.get('/health', (req, res) => {
  res.send('API is healthy!');
});

export default app;
