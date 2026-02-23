import { Request, Response } from 'express';
import { geminiService } from '../services/gemini.service';
import { creditsService } from '../services/credits.service';

/**
 * Função auxiliar para garantir rollback dos créditos em caso de falha na geração.
 * Risco 1 - Evita "dupla dedução" ou "cobrança sem serviço" (se falhar o Gemini, devolve o crédito).
 */
async function executeWithCredits(
    userId: string, 
    cost: number, 
    feature: string, 
    operation: () => Promise<any>
): Promise<any> {
    try {
        // 1. Deduz primeiro
        await creditsService.deductCredits(userId, cost, feature);
    } catch (deductionError: any) {
        // Falha ao debitar (saldo insuficiente, etc.)
        console.error(`[executeWithCredits] Deduction failed: ${deductionError.message}`);
        // Repassa o erro original para que o controller retorne o status correto
        throw deductionError; 
    }

    try {
        // 2. Tenta operação de IA
        return await operation();
    } catch (operationError) {
        // 3. Se falhar a IA, reembolsa o usuário
        console.error(`[GeminiController] Operation ${feature} failed for user ${userId}. Refunding ${cost} credits.`);
        try {
            await creditsService.refundCredits(userId, cost, feature);
        } catch (refundError) {
             console.error(`[GeminiController] CRITICAL: Refund failed for user ${userId}:`, refundError);
             // Aqui poderíamos logar num sistema de auditoria crítica
        }
        throw operationError; // Propaga erro da IA para o controller tratar a resposta HTTP
    }
}

class GeminiController {
  async generateArticle(req: Request, res: Response) {
    try {
      const uid = (req as any).user?.uid; // Type assertion para evitar erro de TS se user não estiver na definition
      if (!uid) return res.status(401).json({ error: 'Não autenticado' });

      // Chama a função auxiliar que gerencia os créditos
      const result = await executeWithCredits(uid, 2, 'generate_article', async () => {
        return await geminiService.generateArticle(req.body);
      });

      return res.json(result);
    } catch (error: any) {
      console.error('generateArticle error:', error);
      // Se for erro de saldo, retorna 403 ou 402. Se for erro da IA, retorna 500.
      const isBalanceError = error.message && (
          error.message.includes('Saldo insuficiente') || 
          error.message.includes('insufficient funds')
      );
      
      return res.status(isBalanceError ? 403 : 500)
        .json({ error: error.message || 'Falha ao gerar artigo' });
    }
  }

  async generateTutorial(req: Request, res: Response) {
    try {
      const uid = req.user?.uid;
      if (!uid) return res.status(401).json({ error: 'Não autenticado' });

      const result = await executeWithCredits(uid, 3, 'generate_tutorial', async () => {
        return await geminiService.generateTutorial(req.body);
      });
      
      return res.json(result);
    } catch (error: any) {
      console.error('generateTutorial error:', error);
      return res.status(error.message.includes('Saldo') ? 403 : 500).json({ error: error.message });
    }
  }

  async generateRoadmap(req: Request, res: Response) {
    try {
      const uid = req.user?.uid;
      if (!uid) return res.status(401).json({ error: 'Não autenticado' });

      const result = await executeWithCredits(uid, 5, 'generate_roadmap', async () => {
        return await geminiService.generateRoadmap(req.body);
      });

      return res.json(result);
    } catch (error: any) {
        console.error('generateRoadmap error:', error);
        return res.status(error.message.includes('Saldo') ? 403 : 500).json({ error: error.message });
    }
  }

  async generateProjectSuggestion(req: Request, res: Response) {
    try {
      const uid = req.user?.uid;
      if (!uid) return res.status(401).json({ error: 'Não autenticado' });

      const result = await executeWithCredits(uid, 4, 'generate_project', async () => {
        return await geminiService.generateProjectSuggestion(req.body);
      });

      return res.json(result);
    } catch (error: any) {
        console.error('generateProjectSuggestion error:', error);
        return res.status(error.message.includes('Saldo') ? 403 : 500).json({ error: error.message });
    }
  }

  async analyzeSoftSkills(req: Request, res: Response) {
    try {
      const uid = req.user?.uid;
      if (!uid) return res.status(401).json({ error: 'Não autenticado' });

      const result = await executeWithCredits(uid, 2, 'analyze_soft_skills', async () => {
        return await geminiService.analyzeSoftSkills(req.body);
      });

      return res.json(result);
    } catch (error: any) {
        console.error('analyzeSoftSkills error:', error);
        return res.status(error.message.includes('Saldo') ? 403 : 500).json({ error: error.message });
    }
  }

  // NOVO: analyzeSkills
  async analyzeSkills(req: Request, res: Response) {
    try {
      const uid = req.user?.uid;
      if (!uid) return res.status(401).json({ error: 'Não autenticado' });

      const result = await executeWithCredits(uid, 2, 'analyze_skills', async () => {
        return await geminiService.analyzeSkills(req.body);
      });

      return res.json(result);
    } catch (error: any) {
        console.error('analyzeSkills error:', error);
        return res.status(error.message.includes('Saldo') ? 403 : 500).json({ error: error.message });
    }
  }

  // NOVO: analyzeGithubProject
  async analyzeGithubProject(req: Request, res: Response) {
    try {
      const uid = req.user?.uid;
      if (!uid) return res.status(401).json({ error: 'Não autenticado' });
      
      const { readme, description } = req.body;
      if (!readme && !description) return res.status(400).json({ error: 'Missing readme or description' });

      const result = await executeWithCredits(uid, 0, 'analyze_github_project', async () => {
        return await geminiService.analyzeGithubProject(req.body);
      });

      return res.json(result);
    } catch (error: any) {
      console.error('analyzeGithubProject error:', error);
      return res.status(error.message.includes('Saldo') ? 403 : 500).json({ error: error.message });
    }
  }

  async generateText(req: Request, res: Response) {
    try {
        const uid = req.user?.uid;
        if (!uid) return res.status(401).json({ error: 'Não autenticado' });

        const { prompt } = req.body;
        if (!prompt) return res.status(400).json({ error: 'Missing prompt' });

        const result = await executeWithCredits(uid, 1, 'generate_text', async () => {
           const text = await geminiService.generateText(prompt);
           return { text };
        });

      return res.json(result);
    } catch (error: any) {
        console.error('generateText error:', error);
        return res.status(error.message.includes('Saldo') ? 403 : 500).json({ error: error.message });
    }
  }

  async generateImage(req: Request, res: Response) {
    try {
        const uid = req.user?.uid;
        if (!uid) return res.status(401).json({ error: 'Não autenticado' });

        const { prompt } = req.body;
        if (!prompt) return res.status(400).json({ error: 'Missing prompt' });

        const result = await executeWithCredits(uid, 4, 'generate_image', async () => {
           const imageBase64 = await geminiService.generateImage(prompt);
           return { imageBase64 };
        });

      return res.json(result);
    } catch (error: any) {
      console.error('generateImage error:', error);
      return res.status(error.message.includes('Saldo') ? 403 : 500).json({ error: error.message });
    }
  }
}

export const geminiController = new GeminiController();
