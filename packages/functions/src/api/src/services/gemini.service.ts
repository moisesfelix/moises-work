import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { defineSecret } from 'firebase-functions/params';

const geminiApiKey = defineSecret('GEMINI_KEY');

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

export interface RoadmapRequest {
  goal: string;               // Ex: "Quero me tornar dev Vue.js"
  currentRole?: string;        // Ex: "Entregador"
  months: number;              // Período em meses
}

export interface RoadmapStep {
  id: string;
  title: string;
  description: string;
  topics: string[];            // Tópicos a estudar
  projectSuggestion?: string;  // Sugestão de projeto prático
  estimatedHours: number;
  dependsOn?: string[];        // IDs dos passos anteriores
}

export interface Roadmap {
  id: string;
  title: string;
  overview: string;
  steps: RoadmapStep[];
  totalMonths: number;
  resources: string[];         // Links, livros, etc.
}

export interface ProjectSuggestion {
  title: string;
  description: string;
  technologies: string[];
  difficulty: 'iniciante' | 'intermediário' | 'avançado';
  estimatedTime: string;
  features: string[];
}

export interface SoftSkillAnalysis {
  communication: number;       // 0-100
  teamwork: number;
  problemSolving: number;
  adaptability: number;
  leadership: number;
  suggestedImprovements: string[];
}

class GeminiService {
  private textModel: GenerativeModel | undefined;

  private getModel(): GenerativeModel {
    if (!this.textModel) {
      const genAI = new GoogleGenerativeAI(geminiApiKey.value());
      this.textModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    }
    return this.textModel;
  }

  async generateArticle(request: ArticleGenerationRequest): Promise<GeneratedArticle> {
    const model = this.getModel();
    const prompt = `
    You are a professional technical writer (Expert).
    Create a JSON article about: "${request.topic}".
    Context: Category ${request.category}, Tone ${request.tone || 'Professional'}.
    
    IMPORTANT: Return ONLY a valid JSON object. No markdown.
    Required structure:
    {
      "title": "Engaging title",
      "excerpt": "Short summary (SEO)",
      "content": "<p>Complete and rich HTML content...</p>",
      "category": "${request.category}",
      "slug": "user-friendly-url",
      "readTime": "X min",
      "makeImagePrompt": "Detailed ENGLISH prompt to generate a tech/modern/minimalist style cover image.",
      "codeBlocks": [],
      "tags": ["tag1", "tag2", "tag3"]
    }
    `;

    try {
      const result = await model.generateContent(prompt);
      let text = result.response.text();
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(text);
    } catch (error) {
      console.error('GeminiService: Failed to generate/parse article', error);
      throw new Error('Failed to generate article text.');
    }
  }

  async generateTutorial(request: TutorialGenerationRequest): Promise<GeneratedTutorial> {
    const model = this.getModel();
    const prompt = `
    Create a step-by-step technical tutorial in JSON about: "${request.topic}".
    Level: ${request.difficulty}.
    
    IMPORTANT: Return ONLY a valid JSON object. No markdown.
    Structure:
    {
      "title": "Title",
      "slug": "slug",
      "category": "${request.category}",
      "difficulty": "${request.difficulty}",
      "duration": "XX min",
      "excerpt": "Summary",
      "makeImagePrompt": "ENGLISH prompt for cover image.",
      "steps": [{ "title": "Step 1", "content": "HTML...", "code": "..." }],
      "tags": ["tag1", "tag2"]
    }
    `;

    try {
      const result = await model.generateContent(prompt);
      let text = result.response.text();
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(text);
    } catch (error) {
      console.error('GeminiService: Failed to generate tutorial', error);
      throw new Error('Failed to generate tutorial.');
    }
  }

  async generateRoadmap(request: RoadmapRequest): Promise<Roadmap> {
    const model = this.getModel();
    const prompt = `
    You are an expert career coach and learning path designer.
    User's goal: "${request.goal}".
    Current role: "${request.currentRole || 'Not specified'}".
    Time available: ${request.months} months.
    
    Create a detailed, step-by-step learning roadmap in JSON format.
    Each step should include a title, description, list of topics to study, a suggested practical project (if applicable), estimated hours, and dependencies (if any).
    
    IMPORTANT: Return ONLY a valid JSON object. No markdown.
    Structure:
    {
      "id": "unique-id",
      "title": "Roadmap title",
      "overview": "Brief overview of the journey",
      "steps": [
        {
          "id": "step-1",
          "title": "Step title",
          "description": "What to learn",
          "topics": ["topic1", "topic2"],
          "projectSuggestion": "Optional project idea",
          "estimatedHours": 10,
          "dependsOn": []
        }
      ],
      "totalMonths": ${request.months},
      "resources": ["link1", "link2"]
    }
    `;

    try {
      const result = await model.generateContent(prompt);
      let text = result.response.text();
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(text);
    } catch (error) {
      console.error('GeminiService: Failed to generate roadmap', error);
      throw new Error('Failed to generate roadmap.');
    }
  }

  async generateProjectSuggestion(technologies: string[], level: string): Promise<ProjectSuggestion> {
    const model = this.getModel();
    const prompt = `
    Suggest a practical project for a developer using: ${technologies.join(', ')}.
    Difficulty level: ${level}.
    
    Return a JSON object with:
    - title
    - description
    - technologies (array)
    - difficulty (iniciante/intermediário/avançado)
    - estimatedTime (e.g., "2 weeks")
    - features (array of key features)
    
    ONLY JSON, no markdown.
    `;

    try {
      const result = await model.generateContent(prompt);
      let text = result.response.text();
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(text);
    } catch (error) {
      console.error('GeminiService: Failed to generate project suggestion', error);
      throw new Error('Failed to generate project suggestion.');
    }
  }

  async analyzeSoftSkills(texts: string[]): Promise<SoftSkillAnalysis> {
    const model = this.getModel();
    const combined = texts.join('\n\n').substring(0, 10000); // limit
    const prompt = `
    Analyze the following texts (articles, project descriptions, etc.) written by a developer.
    Based on the content, infer their soft skills and provide a JSON with scores (0-100) for:
    - communication
    - teamwork
    - problemSolving
    - adaptability
    - leadership
    Also suggest 2-3 improvements they could focus on.

    Texts:
    """
    ${combined}
    """

    Return ONLY JSON, no markdown.
    `;

    try {
      const result = await model.generateContent(prompt);
      let text = result.response.text();
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(text);
    } catch (error) {
      console.error('GeminiService: Failed to analyze soft skills', error);
      throw new Error('Failed to analyze soft skills.');
    }
  }

  async generateText(prompt: string): Promise<string> {
    const model = this.getModel();
    try {
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error('GeminiService: Failed to generate text', error);
      throw new Error('Failed to generate text.');
    }
  }

  async generateImage(prompt: string): Promise<string> {
    const MODEL = "models/imagen-3.0-generate-001";
    const API_KEY = geminiApiKey.value();
    const URL = `https://generativelanguage.googleapis.com/v1beta/${MODEL}:predict?key=${API_KEY}`;
    
    try {
        const response = await fetch(URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                instances: [ { prompt: prompt } ],
                parameters: {
                    sampleCount: 1,
                    aspectRatio: "16:9",
                    outputMimeType: "image/jpeg"
                }
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`Google API Error: ${response.status} - ${errorData?.error?.message || response.statusText}`);
        }

        const data: any = await response.json();
        if (!data.predictions || !data.predictions[0]?.bytesBase64Encoded) {
            throw new Error("API responded OK, but with no image data.");
        }
        return data.predictions[0].bytesBase64Encoded;
    } catch (error) {
        console.warn("AI Image Generation Failed. Using fallback.", error);
        try {
            const fallbackUrl = `https://picsum.photos/seed/${Date.now()}/800/600`;
            const fallbackResponse = await fetch(fallbackUrl);
            if (!fallbackResponse.ok) throw new Error("Fallback failed");
            const arrayBuffer = await fallbackResponse.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            return buffer.toString('base64');
        } catch (fallbackError) {
            throw new Error("Could not obtain any image.");
        }
    }
  }
}

export const geminiService = new GeminiService();
