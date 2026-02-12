import * as express from 'express';
import * as cors from 'cors';
import { geminiRoutes } from './routes/gemini.routes';

const app = express();

// Middlewares
app.use(cors({ origin: '*' }));
app.use(express.json());

// API Routes
app.use('/v1/gemini', geminiRoutes);

// Simple health check
app.get('/health', (req, res) => {
  res.send('API is healthy!');
});

export default app;
