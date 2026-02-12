import { onRequest } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import app from './api';

const geminiApiKey = defineSecret('GEMINI_KEY');

export const api = onRequest({ secrets: [geminiApiKey] }, app);
