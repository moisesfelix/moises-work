import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { defineSecret } from 'firebase-functions/params';

const geminiApiKey = defineSecret('GEMINI_KEY');

// --- INTERFACES (Copied from frontend) ---
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
  makeImagePrompt: string; // Prompt for the image
  codeBlocks?: Array<{ 
    language: string;
    code: string;
  }>;
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
  steps: Array<{ 
    title: string;
    content: string;
    code?: string;
  }>;
  tags?: string[];
}


// --- SERVICE ---
class GeminiService {
  private textModel: GenerativeModel | undefined;

  constructor() {
    // Constructor is now empty. Initialization will happen on demand.
  }

  private getModel(): GenerativeModel {
    if (!this.textModel) {
      const genAI = new GoogleGenerativeAI(geminiApiKey.value());
      this.textModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    }
    return this.textModel;
  }


  /**
   * Generates the text content of the article in JSON format
   */
  async generateArticle(request: ArticleGenerationRequest): Promise<GeneratedArticle> {
    const model = this.getModel();
    const prompt = `
    You are a professional technical writer (Expert).
    Create a JSON article about: "${request.topic}".
    Context: Category ${request.category}, Tone ${request.tone || 'Professional'}.
    
    IMPORTANT: Return ONLY a valid JSON object. Do not include any markdown formatting like \`\`\`json.
    The response must be the JSON object itself.
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
      const response = result.response;
      let text = response.text();

      // Robust cleaning to ensure valid JSON
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();

      return JSON.parse(text);
    } catch (error) {
      console.error('GeminiService: Failed to generate/parse article', error);
      throw new Error('Failed to generate article text.');
    }
  }

  /**
   * Generates the text content of a tutorial
   */
  async generateTutorial(request: TutorialGenerationRequest): Promise<GeneratedTutorial> {
    const model = this.getModel();
    const prompt = `
    Create a step-by-step technical tutorial in JSON about: "${request.topic}".
    Level: ${request.difficulty}.
    
    IMPORTANT: Return ONLY a valid JSON object. Do not include any markdown formatting like \`\`\`json.
    The response must be the JSON object itself.
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
  
  /**
   * Analyzes experiences and projects to extract and categorize skills
   */
  async analyzeSkills(data: { experiences: any[]; projects: any[]; articles: any[]; tutorials: any[] }): Promise<any> {
    const model = this.getModel();
    const prompt = `
    You are an expert in analyzing resumes and technical profiles.
    Analyze the following professional experiences, portfolio projects, written technical articles, and created tutorials to extract and categorize technical skills.
    
    DATA FOR ANALYSIS:
    Experiences: ${JSON.stringify(data.experiences.map(e => ({ role: e.role, description: e.description, technologies: e.technologies })))}
    Projects: ${JSON.stringify(data.projects.map(p => ({ title: p.title, description: p.description, technologies: p.technologies, tags: p.tags })))}
    Articles: ${JSON.stringify(data.articles.map(a => ({ title: a.title, category: a.category, tags: a.tags })))}
    Tutorials: ${JSON.stringify(data.tutorials.map(t => ({ title: t.title, category: t.category, tags: t.tags })))}

    TASK:
    1. Identify all technical skills, tools, languages, and frameworks mentioned or implied.
    2. Consider the TAGS of Articles and Tutorials as strong indicators of technical knowledge and skill.
    3. Group them into logical categories (e.g., "Frontend", "Backend", "DevOps", "Mobile", "Database", "Tools", etc.).
    4. For each skill, estimate a proficiency level (0-100) based on the frequency of use and complexity of the projects/articles where it appears.
       - If it appears many times or in complex projects -> 80-100%
       - If it appears moderately -> 50-79%
       - If it appears rarely -> 20-49%
    
    REQUIRED RETURN:
    Return ONLY a valid JSON with the following structure (no markdown):
    {
      "Frontend": [
        { "name": "React", "percent": 90 },
        { "name": "CSS", "percent": 85 }
      ],
      "Backend": [
        { "name": "Node.js", "percent": 80 }
      ],
      "Database": [],
      "DevOps": [],
      "Tools": [],
      "Mobile": []
    }
    `;

    try {
      const result = await model.generateContent(prompt);
      let text = result.response.text();
      
      // Robust cleaning to ensure valid JSON
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      
      return JSON.parse(text);
    } catch (error) {
      console.error('GeminiService: Failed to analyze skills', error);
      throw new Error('Failed in AI skill analysis.');
    }
  }

  /**
   * Generates simple text from a prompt.
   */
  async generateText(prompt: string): Promise<string> {
    const model = this.getModel();
    try {
      const result = await model.generateContent(prompt);
      const response = result.response;
      return response.text();
    } catch (error) {
      console.error('GeminiService: Failed to generate text', error);
      throw new Error('Failed to generate text.');
    }
  }
}

export const geminiService = new GeminiService();