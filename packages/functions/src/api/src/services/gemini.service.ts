import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { defineSecret } from 'firebase-functions/params';

const geminiApiKey = defineSecret('GEMINI_KEY');

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

export interface GithubAnalysisRequest {
  readme: string;
  commits: any[];
  languages: any;
  description: string;
  repoName: string;
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
    const persona = request.persona || 'Desenvolvedor FullStack e Professor';

    const prompt = `
You are an expert AI agent embodying the persona: "${persona}".
Your tone, vocabulary, examples and depth must reflect this identity perfectly.

Create a complete, engaging article about: "${request.topic}".
Category: ${request.category}.
Tone: ${request.tone || 'professional and educational'}.
Length: ${request.length || 'medium'}.

Return ONLY valid JSON. No markdown.

Structure:
{
  "title": "...",
  "excerpt": "...",
  "content": "<p>HTML completo...</p>",
  "category": "${request.category}",
  "slug": "url-amigavel",
  "readTime": "X min",
  "makeImagePrompt": "Prompt em inglês para capa",
  "codeBlocks": [],
  "tags": ["tag1", "tag2"]
}
    `;

    const result = await model.generateContent(prompt);
    let text = result.response.text().replace(/```json|```/g, '').trim();
    return JSON.parse(text);
  }

  async generateTutorial(request: TutorialGenerationRequest): Promise<GeneratedTutorial> {
    const model = this.getModel();
    const persona = request.persona || 'Desenvolvedor FullStack e Professor';

    const prompt = `
You are an expert AI agent embodying the persona: "${persona}".
Adapt your teaching style, examples and language to this identity.

Create a step-by-step tutorial about: "${request.topic}".
Difficulty: ${request.difficulty}.
Category: ${request.category}.
Duration: ${request.duration || '30-60 min'}.

Return ONLY valid JSON. No markdown.

Structure:
{
  "title": "...",
  "slug": "...",
  "category": "${request.category}",
  "difficulty": "${request.difficulty}",
  "duration": "...",
  "excerpt": "...",
  "makeImagePrompt": "...",
  "steps": [{ "title": "...", "content": "HTML...", "code": "..." }],
  "tags": ["tag1", "tag2"]
}
    `;

    const result = await model.generateContent(prompt);
    let text = result.response.text().replace(/```json|```/g, '').trim();
    return JSON.parse(text);
  }

  async generateRoadmap(request: RoadmapRequest): Promise<Roadmap> {
    const model = this.getModel();
    const persona = request.persona || 'Desenvolvedor FullStack e Professor';

    const prompt = `
You are an expert career coach and learning path designer, embodying the persona: "${persona}".
User's goal: "${request.goal}".
Current role: "${request.currentRole || 'Not specified'}".
Time available: ${request.months} months.

Create a detailed, step-by-step learning roadmap in JSON format.
Each step should include a title, description, list of topics to study, a suggested practical project (if applicable), estimated hours, and dependencies (if any).

Return ONLY valid JSON. No markdown.

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

    const result = await model.generateContent(prompt);
    let text = result.response.text().replace(/```json|```/g, '').trim();
    return JSON.parse(text);
  }

  async generateProjectSuggestion(request: ProjectSuggestionRequest): Promise<ProjectSuggestion> {
    const model = this.getModel();
    const persona = request.persona || 'Desenvolvedor FullStack e Professor';

    const prompt = `
You are an expert developer and mentor embodying the persona: "${persona}".
Suggest a practical project for a developer using: ${request.technologies.join(', ')}.
Difficulty level: ${request.level}.

Return ONLY valid JSON. No markdown.

Structure:
{
  "title": "...",
  "description": "...",
  "technologies": [...],
  "difficulty": "...",
  "estimatedTime": "...",
  "features": ["feature1", "feature2"]
}
    `;

    const result = await model.generateContent(prompt);
    let text = result.response.text().replace(/```json|```/g, '').trim();
    return JSON.parse(text);
  }

  async analyzeSoftSkills(request: SoftSkillsAnalysisRequest): Promise<SoftSkillAnalysis> {
    const model = this.getModel();
    const persona = request.persona || 'Desenvolvedor FullStack e Professor';
    const combined = request.texts.join('\n\n').substring(0, 10000);

    const prompt = `
You are an expert psychologist and career coach embodying the persona: "${persona}".
Analyze the following texts written by a person and infer their soft skills.
Provide scores (0-100) for:
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

Return ONLY valid JSON. No markdown.

Structure:
{
  "communication": 0-100,
  "teamwork": 0-100,
  "problemSolving": 0-100,
  "adaptability": 0-100,
  "leadership": 0-100,
  "suggestedImprovements": ["improvement1", "improvement2"]
}
    `;

    const result = await model.generateContent(prompt);
    let text = result.response.text().replace(/```json|```/g, '').trim();
    return JSON.parse(text);
  }

  // NOVO: analyzeSkills (técnicas)
  async analyzeSkills(request: SkillsAnalysisRequest): Promise<any> {
    const model = this.getModel();
    const persona = request.persona || 'Desenvolvedor FullStack e Professor';

    const experiences = JSON.stringify(request.experiences.map(e => ({ role: e.role, description: e.description, technologies: e.technologies })));
    const projects = JSON.stringify(request.projects.map(p => ({ title: p.title, description: p.description, technologies: p.technologies, tags: p.tags })));
    const articles = JSON.stringify(request.articles.map(a => ({ title: a.title, category: a.category, tags: a.tags })));
    const tutorials = JSON.stringify(request.tutorials.map(t => ({ title: t.title, category: t.category, tags: t.tags })));

    const prompt = `
You are an expert in analyzing technical profiles, embodying the persona: "${persona}".
Analyze the following professional experiences, portfolio projects, articles and tutorials to extract and categorize technical skills.

DATA:
Experiences: ${experiences}
Projects: ${projects}
Articles: ${articles}
Tutorials: ${tutorials}

TASK:
1. Identify all technical skills, tools, languages, frameworks.
2. Group them into logical categories (e.g., "Frontend", "Backend", "DevOps", etc.).
3. For each skill, estimate a proficiency level (0-100) based on frequency and complexity.

Return ONLY valid JSON with this structure (no markdown):
{
  "Frontend": [{ "name": "React", "percent": 90 }],
  "Backend": [],
  "Database": [],
  "DevOps": [],
  "Tools": [],
  "Mobile": []
}
    `;

    const result = await model.generateContent(prompt);
    let text = result.response.text().replace(/```json|```/g, '').trim();
    return JSON.parse(text);
  }

  // NOVO: analyzeGithubProject
  async analyzeGithubProject(request: GithubAnalysisRequest): Promise<any> {
    const model = this.getModel();
    
    // Resume README e commits para não estourar tokens
    const readmeSnippet = request.readme.substring(0, 8000);
    const commitsSnippet = JSON.stringify(request.commits.slice(0, 15).map(c => c.message));
    
    const prompt = `
You are a Senior Tech Lead and Project Manager.
Analyze the following GitHub repository data to extract structured project information for a portfolio.

REPO NAME: ${request.repoName}
DESCRIPTION: ${request.description}
LANGUAGES: ${JSON.stringify(request.languages)}
COMMITS: ${commitsSnippet}
README: 
"""
${readmeSnippet}
"""

TASK:
1. Create a catchy, professional Title.
2. Write a compelling Description (2-3 paragraphs) highlighting features, tech stack, and purpose.
3. Determine the Category (Web, Mobile, AI, Backend, Tool, etc.).
4. Generate relevant Tags (tech stack + concepts).
5. Create a prompt for an AI image generator to create a cover image for this project.

Return ONLY valid JSON:
{
  "title": "Project Title",
  "description": "Professional description...",
  "category": "Web",
  "tags": ["React", "Firebase", "SAAS"],
  "imagePrompt": "A futuristic dashboard displaying..."
}
    `;

    const result = await model.generateContent(prompt);
    let text = result.response.text().replace(/```json|```/g, '').trim();
    return JSON.parse(text);
  }

  async generateText(prompt: string): Promise<string> {
    const model = this.getModel();
    const result = await model.generateContent(prompt);
    return result.response.text();
  }

  async generateImage(prompt: string): Promise<string> {
    const MODEL = "models/imagen-4.0-generate-001";
    const API_KEY = geminiApiKey.value();
    const URL = `https://generativelanguage.googleapis.com/v1beta/${MODEL}:predict?key=${API_KEY}`;

    const response = await fetch(URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        instances: [{ prompt }],
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
  }
}

export const geminiService = new GeminiService();
