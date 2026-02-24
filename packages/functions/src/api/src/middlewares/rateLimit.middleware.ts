import { Request, Response, NextFunction } from 'express';
import { db } from '../../../configs/firebase';

const WINDOW_SIZE_MS = 60 * 1000; // 1 minuto
const MAX_REQUESTS = 10; // 10 requisições por minuto

export const rateLimitMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const uid = req.user?.uid;
  if (!uid) {
    // Se não autenticado, ignora (ou aplica por IP se necessário, mas aqui o foco é custo por usuário)
    return next();
  }

  const now = Date.now();
  const ref = db.ref(`rateLimits/${uid}`);

  try {
    const { committed, snapshot } = await ref.transaction((currentData) => {
      if (currentData === null) {
        return { count: 1, windowStart: now };
      }

      if (now - currentData.windowStart > WINDOW_SIZE_MS) {
        // Janela expirou, reseta
        return { count: 1, windowStart: now };
      }

      if (currentData.count >= MAX_REQUESTS) {
        return undefined; // Aborta transação
      }

      return { count: currentData.count + 1, windowStart: currentData.windowStart };
    });

    if (!committed) {
      const val = snapshot.val();
      if (val && val.count >= MAX_REQUESTS && (now - val.windowStart <= WINDOW_SIZE_MS)) {
        console.warn(`[RateLimit] User ${uid} exceeded limit.`);
        return res.status(429).json({ error: 'Muitas requisições. Tente novamente em alguns segundos.' });
      }
    }

    next();
  } catch (error) {
    console.error('RateLimit middleware error:', error);
    next();
  }
};
