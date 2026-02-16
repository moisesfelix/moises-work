import * as express from 'express';
import * as cors from 'cors';
import { linkRoutes } from './src/routes/link.routes';

const app = express();

app.use(cors({ origin: true }));
app.use(express.json());

// Main Router
// This router handles ALL paths because Firebase Rewrite sends everything here
// for /share/* and also /:portfolioId/artigo/* etc.

app.use('/', linkRoutes);

export default app;
