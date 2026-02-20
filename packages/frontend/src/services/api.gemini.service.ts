import { authService } from './auth.service';

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
  makeImagePrompt: string;
  codeBlocks?: Array<{ language: string; code: string }>;
  tags?: string[];
}

export interface GeneratedTutorial {
  title: string;
  slug: string;
  category: string;
  difficulty: string;
  duration: string;
  excerpt: string;
  makeImagePrompt: string;
  steps: Array<{ title: string; content: string; code?: string }>;
  tags?: string[];
}

export interface RoadmapRequest {
  goal: string;
  currentRole?: string;
  months: number;
}

export interface Roadmap {
  id: string;
  title: string;
  overview: string;
  steps: Array<{
    id: string;
    title: string;
    description: string;
    topics: string[];
    projectSuggestion?: string;
    estimatedHours: number;
    dependsOn?: string[];
  }>;
  totalMonths: number;
  resources: string[];
}

export interface ProjectSuggestion {
  title: string;
  description: string;
  technologies: string[];
  difficulty: string;
  estimatedTime: string;
  features: string[];
}

export interface SoftSkillAnalysis {
  communication: number;
  teamwork: number;
  problemSolving: number;
  adaptability: number;
  leadership: number;
  suggestedImprovements: string[];
}

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

  // NOVOS MÉTODOS
  async generateRoadmap(request: RoadmapRequest): Promise<Roadmap> {
    return this.post<Roadmap>('/v1/gemini/generate-roadmap', request);
  }

  async generateProjectSuggestion(technologies: string[], level: string): Promise<ProjectSuggestion> {
    return this.post<ProjectSuggestion>('/v1/gemini/generate-project-suggestion', { technologies, level });
  }

  async analyzeSoftSkills(texts: string[]): Promise<SoftSkillAnalysis> {
    return this.post<SoftSkillAnalysis>('/v1/gemini/analyze-soft-skills', { texts });
  }
}

export const apiGeminiService = new ApiGeminiService();
