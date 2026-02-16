
// --- INTERFACES ---
export interface ArticleGenerationRequest {
  topic: string;
  category: string;
  tone?: string;
  length?: 'short' | 'medium' | 'long';
}

export interface TutorialGenerationRequest {
  topic: string;
  difficulty: string;
  category: string;
  duration?: string;
}

export interface GeneratedArticle {
  title: string;
  excerpt: string;
  content: string; // HTML
  category: string;
  slug: string;
  readTime: string;
  makeImagePrompt: string; // Prompt para a imagem
  codeBlocks?: Array<{
    language: string;
    code: string;
  }>;
  tags?: string[]; // Adicionado: Tags do artigo
}

export interface GeneratedTutorial {
  title: string;
  slug: string;
  category: string;
  difficulty: string;
  duration: string;
  excerpt: string;
  makeImagePrompt: string;
  steps: Array<{
    title: string;
    content: string;
    code?: string;
  }>;
  tags?: string[];
}

// --- SERVIÇO ---
import { authService } from './auth.service';

class ApiGeminiService {
  private baseUrl = import.meta.env.VITE_API_URL || 'https://api-4r3pfwtxnq-uc.a.run.app';

  private async post<T>(endpoint: string, body: unknown): Promise<T> {
    const authHeaders = await authService.getAuthHeader();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...authHeaders
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      let errorMessage = 'Failed to fetch';
      try {
        const error = await response.json();
        errorMessage = error.message || error.error || errorMessage;
      } catch {
        errorMessage = `Request failed: ${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    return response.json();
  }

  async generateArticle(request: ArticleGenerationRequest): Promise<GeneratedArticle> {
    return this.post<GeneratedArticle>('/v1/gemini/generate-article', request);
  }

  async generateTutorial(request: TutorialGenerationRequest): Promise<GeneratedTutorial> {
    return this.post<GeneratedTutorial>('/v1/gemini/generate-tutorial', request);
  }

  async analyzeSkills(data: { experiences: any[]; projects: any[]; articles: any[]; tutorials: any[] }): Promise<any> {
    return this.post<any>('/v1/gemini/analyze-skills', data);
  }

  async generateText(prompt: string): Promise<string> {
    const response = await this.post<{text: string}>('/v1/gemini/generate-text', { prompt });
    return response.text;
  }

  async generateImage(prompt: string): Promise<string> {
    const response = await this.post<{imageBase64: string}>('/v1/gemini/generate-image', { prompt });
    return response.imageBase64;
  }
}

export const apiGeminiService = new ApiGeminiService();
