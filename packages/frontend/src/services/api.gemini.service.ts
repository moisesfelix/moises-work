
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
class ApiGeminiService {
  private baseUrl = 'https://api-4r3pfwtxnq-uc.a.run.app';

  private async post<T>(endpoint: string, body: unknown): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch');
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
}

export const apiGeminiService = new ApiGeminiService();
