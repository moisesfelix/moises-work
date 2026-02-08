import { GoogleGenerativeAI } from '@google/generative-ai';

// Recupera a chave do arquivo .env
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

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
}

// --- SERVIÇO ---
class GeminiService {
  private textModel;

  constructor() {
    // Modelo de texto (Gemini 2.0 Flash é rápido e bom para JSON)
    this.textModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  }

  /**
   * Converte a string Base64 retornada pela IA em um objeto Blob (Arquivo)
   * Isso permite que o storage.service trate o dado como um upload comum.
   */
  private base64ToBlob(base64: string, mimeType: string): Blob {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  }

  /**
   * Gera o conteúdo textual do artigo em formato JSON
   */
  async generateArticle(request: ArticleGenerationRequest): Promise<GeneratedArticle> {
    const prompt = `
    Você é um escritor técnico profissional (Expert).
    Crie um artigo JSON sobre: "${request.topic}".
    Contexto: Categoria ${request.category}, Tom ${request.tone || 'Profissional'}.
    
    IMPORTANTE: Retorne APENAS um JSON válido. Sem markdown (\`\`\`).
    Estrutura obrigatória:
    {
      "title": "Título atraente",
      "excerpt": "Resumo curto (SEO)",
      "content": "<p>Conteúdo HTML completo e rico...</p>",
      "category": "${request.category}",
      "slug": "url-amigavel",
      "readTime": "X min",
      "makeImagePrompt": "Prompt em INGLÊS detalhado para gerar uma imagem de capa estilo tech/modern/minimalist.",
      "codeBlocks": []
    }
    `;

    try {
      const result = await this.textModel.generateContent(prompt);
      const response = result.response;
      let text = response.text();

      // Limpeza robusta para garantir JSON válido
      text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

      return JSON.parse(text);
    } catch (error) {
      console.error('GeminiService: Falha ao gerar/parsear artigo', error);
      throw new Error('Falha na geração do texto do artigo.');
    }
  }

  /**
   * Gera o conteúdo textual de um tutorial
   */
  async generateTutorial(request: TutorialGenerationRequest): Promise<GeneratedTutorial> {
    const prompt = `
    Crie um tutorial técnico passo-a-passo em JSON sobre: "${request.topic}".
    Nível: ${request.difficulty}.
    
    Retorne APENAS JSON válido. Sem markdown.
    Estrutura:
    {
      "title": "Título",
      "slug": "slug",
      "category": "${request.category}",
      "difficulty": "${request.difficulty}",
      "duration": "XX min",
      "excerpt": "Resumo",
      "makeImagePrompt": "Prompt em INGLÊS para imagem de capa.",
      "steps": [{ "title": "Passo 1", "content": "HTML...", "code": "..." }]
    }
    `;

    try {
      const result = await this.textModel.generateContent(prompt);
      let text = result.response.text();
      text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(text);
    } catch (error) {
      console.error('GeminiService: Falha ao gerar tutorial', error);
      throw new Error('Falha na geração do tutorial.');
    }
  }

  /**
   * Gera uma imagem usando o modelo Imagen 3 via REST API
   * Retorna um Blob pronto para upload.
   */
  async generateImage(prompt: string): Promise<Blob> {
    // Configuração do modelo Imagen 3
    const MODEL = "models/imagen-4.0-generate-001";
    const URL = `https://generativelanguage.googleapis.com/v1beta/${MODEL}:predict?key=${API_KEY}`;

    try {
      console.log(`🎨 GeminiService: Solicitando imagem para "${prompt.substring(0, 20)}..."`);

      const response = await fetch(URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instances: [
            { prompt: prompt }
          ],
          parameters: {
            sampleCount: 1,
            aspectRatio: "16:9", // Formato wide para capa de blog
            outputMimeType: "image/jpeg"
          }
        })
      });

      // Se a API recusar (erro 400, 403, 500)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("❌ Erro API Imagen:", errorData);
        throw new Error(`Google API Error: ${response.status} - ${errorData?.error?.message}`);
      }

      const data = await response.json();

      // Validação se a imagem veio
      if (!data.predictions || !data.predictions[0]?.bytesBase64Encoded) {
        throw new Error("API respondeu OK, mas sem imagem.");
      }

      // --- CONVERSÃO MÁGICA ---
      const base64Image = data.predictions[0].bytesBase64Encoded;

      // Usa sua função auxiliar para criar o arquivo
      const imageBlob = this.base64ToBlob(base64Image, "image/jpeg");

      console.log("✅ Imagem gerada e convertida para Blob!");
      return imageBlob;

    } catch (error) {
      console.warn("⚠️ Falha na Geração de Imagem IA. Usando Fallback.", error);

      // --- FALLBACK (PLANO B) ---
      // Se a conta não tiver permissão para Imagen ou estourar a cota,
      // baixamos uma imagem aleatória para não impedir o usuário de salvar o artigo.
      try {
        const fallbackUrl = `https://picsum.photos/seed/${Date.now()}/800/600`;
        const fallbackResponse = await fetch(fallbackUrl);
        if (!fallbackResponse.ok) throw new Error("Fallback falhou");

        return await fallbackResponse.blob();
      } catch (fallbackError) {
        console.error("❌ Falha crítica: Nem IA nem Fallback funcionaram.");
        // Aqui lançamos o erro pois não há imagem para enviar
        throw new Error("Não foi possível obter nenhuma imagem para o artigo.");
      }
    }
  }
}

export const geminiService = new GeminiService();