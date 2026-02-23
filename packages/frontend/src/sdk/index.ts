import { db } from '@/firebase/config'
import { AppSDK } from './AppSDK'

// Defina a URL base para as Cloud Functions/APIs
// Se estiver usando o emulador local, ajuste para localhost
// Se estiver em produção, use a URL do seu projeto Firebase
const API_BASE_URL = 'https://api-4r3pfwtxnq-uc.a.run.app/v1'

export const sdk = new AppSDK({
  db,
  dbVersion: '', // Versão vazia conforme padrão atual do DB
  appUrl: typeof window !== 'undefined' ? window.location.origin : '',
  
  // Custo em créditos para cada funcionalidade
  featureCosts: {
    generate_article: 2,
    generate_tutorial: 3,
    generate_roadmap: 5,
    generate_quiz: 1,
    analyze_soft_skills: 2,
    analyze_skills: 2,
    generate_project: 4,
    generate_description: 1
  },
  
  bonusCredits: 10, // Créditos ganhos por indicação que converte em pagamento
  
  // Mapeamento de endpoints para o GenerationModule (opcional, se quiser centralizar chamadas)
  endpoints: {
    generate_article: `${API_BASE_URL}/gemini/generate-article`,
    generate_tutorial: `${API_BASE_URL}/gemini/generate-tutorial`,
    generate_roadmap: `${API_BASE_URL}/gemini/generate-roadmap`,
    generate_text: `${API_BASE_URL}/gemini/generate-text`,
    generate_image: `${API_BASE_URL}/gemini/generate-image`, // Adicionado
    analyze_soft_skills: `${API_BASE_URL}/gemini/analyze-soft-skills`,
    analyze_skills: `${API_BASE_URL}/gemini/analyze-skills`,
    analyze_github_project: `${API_BASE_URL}/gemini/analyze-github-project`, // Adicionado
  },
  
  // Configuração do módulo PIX
  pixConfig: {
    // Usando URL relativa que será resolvida pelo proxy (rewrite) do Firebase Hosting
    generateUrl: `/payment/generate`, 
    listUrl: `/payment/list`,
    pollingInterval: 5000,
    pollingTimeout: 600000 // 10 minutos
  }
})

// Log inicial para debug
console.log('✅ SDK initialized with DB Version:', sdk.credits.dbVersion)
