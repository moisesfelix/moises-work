import { authService } from './auth.service';

export interface ArticleGenerationRequest {
  topic: string;
  category: string;
  tone?: string;
  length?: 'short' | 'medium' | 'long';
  persona?: string;
}

export interface TutorialGenerationRequest {
  topic: string;
  difficulty: string;
  category: string;
  duration?: string;
  persona?: string;
}

export interface RoadmapRequest {
  goal: string;
  currentRole?: string;
  months: number;
  persona?: string;
}

export interface ProjectSuggestionRequest {
  technologies: string[];
  level: string;
  persona?: string;
}

export interface SoftSkillsAnalysisRequest {
  texts: string[];
  persona?: string;
}

export interface SkillsAnalysisRequest {
  experiences: any[];
  projects: any[];
  articles: any[];
  tutorials: any[];
  persona?: string;
}

export interface GeneratedArticle {
  title: string;
  excerpt: string;
  content: string;
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

export interface Roadmap {
  id: string;
  title: string;
  overview: string;
  steps: Array<{
    id: string;
    title: string;
    description: string;
    topics: string[];
    learningObjectives?: string[];
    projectSuggestion?: string;
    prerequisites?: string[];
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

  async generateRoadmap(request: RoadmapRequest & { skills?: string[] }): Promise<Roadmap> {
    // Lista de skills do usuário para o prompt
    const userSkillsText = request.skills && request.skills.length ? request.skills.join(', ') : 'Nenhuma';

    const prompt = `Gere um roadmap de aprendizado para o objetivo: "${request.goal}".
    
    Contexto:
    - Cargo atual: ${request.currentRole || 'Iniciante'}
    - Prazo: ${request.months} meses
    - Persona do mentor: ${request.persona || 'Tech Lead Sênior'}
    - Habilidades que o usuário JÁ POSSUI: ${userSkillsText}
    
    Requisitos:
    - Se o usuário já possui habilidades essenciais para o objetivo, NÃO crie etapas redundantes para ensinar o básico disso (ex: se sabe Git, não crie etapa "Aprender Git").
    - Identifique dependências claras entre as etapas.
    - Crie 5 a 8 etapas principais que cubram o GAP entre o que ele sabe e o objetivo final.
    - Cada etapa deve ter uma lista de "learningObjectives" e um array de "tags" (tecnologias ensinadas).
    - IMPORTANTE: Identifique "prerequisites" (tags de habilidades) que são necessárias para começar a etapa, mas que NÃO são ensinadas nela (ex: saber 'html' antes de 'react').
    
    Formato de Saída OBRIGATÓRIO (JSON puro):
    {
      "id": "roadmap_${Date.now()}",
      "title": "Roadmap para ${request.goal}",
      "overview": "Visão geral...",
      "totalMonths": ${request.months},
      "resources": ["Recurso 1"],
      "steps": [
        {
          "id": "step_1",
          "title": "Título...",
          "description": "...",
          "topics": ["React", "Hooks"],
          "tags": ["react", "frontend"], 
          "prerequisites": ["html", "css", "javascript"],
          "learningObjectives": ["Objetivo 1"],
          "projectSuggestion": "...",
          "estimatedHours": 20,
          "dependsOn": [] 
        }
      ]
    }`;
    
    const response = await this.post<{ text: string }>('/v1/gemini/generate-text', { prompt });
    
    let jsonString = response.text;
    if (jsonString.includes('```json')) {
      jsonString = jsonString.split('```json')[1].split('```')[0];
    } else if (jsonString.includes('```')) {
      jsonString = jsonString.split('```')[1].split('```')[0];
    }
    
    try {
      const parsedRoadmap = JSON.parse(jsonString.trim());
      
      // SANITIZAÇÃO DE SEGURANÇA
      // Garante que não existam dependências fantasmas (IDs que não existem)
      if (parsedRoadmap.steps && Array.isArray(parsedRoadmap.steps)) {
        const existingIds = new Set(parsedRoadmap.steps.map((s: any) => s.id));
        
        parsedRoadmap.steps = parsedRoadmap.steps.map((step: any) => {
          // Garante arrays
          if (!step.topics) step.topics = [];
          if (!step.learningObjectives) step.learningObjectives = [];
          if (!step.tags) step.tags = [];
          
          // Limpa dependências inválidas
          if (step.dependsOn && Array.isArray(step.dependsOn)) {
            step.dependsOn = step.dependsOn.filter((depId: string) => existingIds.has(depId));
          } else {
            step.dependsOn = [];
          }
          
          return step;
        });
      }

      return parsedRoadmap;
    } catch (e) {
      console.error('Falha ao gerar roadmap estruturado', e);
      throw new Error('Erro ao processar o roadmap gerado pela IA.');
    }
  }

  async generateProjectSuggestion(technologies: string[], level: string, persona?: string): Promise<ProjectSuggestion> {
    return this.post<ProjectSuggestion>('/v1/gemini/generate-project-suggestion', { technologies, level, persona });
  }

  async analyzeSoftSkills(request: SoftSkillsAnalysisRequest): Promise<SoftSkillAnalysis> {
    return this.post<SoftSkillAnalysis>('/v1/gemini/analyze-soft-skills', request);
  }

  async analyzeSkills(request: SkillsAnalysisRequest): Promise<any> {
    return this.post<any>('/v1/gemini/analyze-skills', request);
  }

  async generateStepQuiz(topic: string, difficulty: string, persona?: string): Promise<any> {
    // Como o endpoint específico pode não existir no backend ainda, vamos usar o generate-text com um prompt estruturado
    // e fazer o parse manual, ou assumir que existe um endpoint genérico JSON.
    // Para garantir funcionamento, vou usar um prompt que pede JSON estrito.
    
    const prompt = `Crie um Quiz estilo ENEM com 5 perguntas de múltipla escolha (A, B, C, D, E) sobre o tema: "${topic}".
    
    Contexto:
    - Persona do avaliador: ${persona || 'Professor Especialista'}
    - Nível de dificuldade: ${difficulty}
    
    Formato de Saída OBRIGATÓRIO (JSON Array puro):
    [
      {
        "id": 1,
        "question": "Texto da pergunta...",
        "options": {
          "A": "Opção A",
          "B": "Opção B",
          "C": "Opção C",
          "D": "Opção D",
          "E": "Opção E"
        },
        "correctOption": "C",
        "explanation": "Explicação detalhada do porquê a resposta está correta e dicas sobre o conceito."
      }
    ]`;

    const response = await this.post<{ text: string }>('/v1/gemini/generate-text', { prompt });
    
    // Tratamento para extrair JSON caso venha com markdown ```json ... ```
    let jsonString = response.text;
    if (jsonString.includes('```json')) {
      jsonString = jsonString.split('```json')[1].split('```')[0];
    } else if (jsonString.includes('```')) {
      jsonString = jsonString.split('```')[1].split('```')[0];
    }
    
    try {
      return JSON.parse(jsonString.trim());
    } catch (e) {
      console.error('Falha ao fazer parse do Quiz', e);
      throw new Error('Não foi possível gerar o quiz corretamente. Tente novamente.');
    }
  }

  async generateText(prompt: string): Promise<string> {
    const response = await this.post<{text: string}>('/v1/gemini/generate-text', { prompt });
    return response.text;
  }

  async generateImage(prompt: string): Promise<Blob> {
    const response = await this.post<{imageBase64: string}>('/v1/gemini/generate-image', { prompt });
    
    try {
        // Se a API retornar "data:image/jpeg;base64,...", removemos o prefixo
        const base64Data = response.imageBase64.replace(/^data:image\/\w+;base64,/, "");
        
        // Decodifica a string Base64 para um array de bytes
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        
        // Retorna um Blob pronto para upload
        return new Blob([byteArray], { type: 'image/jpeg' });
    } catch (e) {
        console.error("Erro ao converter imagem Base64 para Blob:", e);
        throw new Error("Falha ao processar imagem gerada.");
    }
  }
}

export const apiGeminiService = new ApiGeminiService();
