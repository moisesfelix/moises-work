import { Request, Response, NextFunction } from 'express';
//import * as admin from 'firebase-admin'; //REMOVE - not using Firebase Admin SDK

// Armazena requests por usuário: userId -> { count, windowStart }
const requests = new Map<string, { count: number; windowStart: number }>();

const WINDOW_SIZE_MS = 60 * 1000; // 1 minuto
const MAX_REQUESTS = 10; // 10 requisições por minuto

export const rateLimitMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const uid = req.user?.uid;
  if (!uid) {
    // Se não autenticado, ignora (ou aplica por IP se necessário, mas aqui o foco é custo por usuário)
    return next();
  }

  const now = Date.now();
  const userRequests = requests.get(uid);

  if (!userRequests) {
    requests.set(uid, { count: 1, windowStart: now });
    return next();
  }

  if (now - userRequests.windowStart > WINDOW_SIZE_MS) {
    // Janela expirou, reseta
    requests.set(uid, { count: 1, windowStart: now });
    return next();
  }

  if (userRequests.count >= MAX_REQUESTS) {
    console.warn(`[RateLimit] User ${uid} exceeded limit.`);
    return res.status(429).json({ error: 'Muitas requisições. Tente novamente em alguns segundos.' });
  }

  userRequests.count++;
  requests.set(uid, userRequests);
  next();
};
