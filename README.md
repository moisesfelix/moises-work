# moises.work

> **Plataforma SaaS de Portfólio Inteligente para Desenvolvedores** — Construa sua presença profissional, valide seu aprendizado e acelere sua contratação com o poder da Inteligência Artificial.

<p align="center">
  <img src="https://img.shields.io/badge/Vue.js-3.x-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Firebase-Functions-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" />
  <img src="https://img.shields.io/badge/Google_Gemini-2.0_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white" />
  <img src="https://img.shields.io/badge/Pinia-State_Management-FFD859?style=for-the-badge&logo=pinia&logoColor=black" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" />
</p>

---

## 📖 Sumário

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Nexus Sprint — O Diferencial](#-nexus-sprint--o-diferencial)
- [Arquitetura e Stack](#-arquitetura-e-stack)
- [Estrutura do Monorepo](#-estrutura-do-monorepo)
- [Fluxo de IA](#-fluxo-de-ia)
- [Sistema de Créditos e Monetização](#-sistema-de-créditos-e-monetização)
- [Como Executar](#-como-executar)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)
- [Scripts Disponíveis](#-scripts-disponíveis)
- [Testes](#-testes)
- [Deploy](#-deploy)
- [Contribuição](#-contribuição)

---

## 🎯 Sobre o Projeto

O **moises.work** nasceu de uma necessidade real do mercado: desenvolvedores talentosos são descartados por processos seletivos que avaliam palavras-chave em currículos, não capacidade real. A plataforma resolve isso em duas frentes:

1. **Para o desenvolvedor**: Um portfólio público completo e inteligente (`seuslug.moises.work`) que documenta projetos, artigos, tutoriais, habilidades e experiências — tudo gerado ou aprimorado por IA.

2. **Para o mercado**: O **Nexus Sprint**, um motor de análise vetorial que calcula matematicamente a distância entre as habilidades de um candidato e os requisitos de uma vaga, propondo um plano de estudo cirúrgico para fechar esse gap em até 48 horas.

---

## ✨ Funcionalidades

### 🗂️ Gerenciamento de Portfólio

| Seção | Descrição |
|---|---|
| **Sobre** | Bio, foto de perfil, persona customizável para a IA |
| **Projetos** | Integração nativa com GitHub (auto-preenchimento via API) |
| **Artigos** | Blog técnico com suporte a Markdown, syntax highlighting e TTS |
| **Tutoriais** | Guias passo a passo com exemplos de código |
| **Experiências** | Histórico profissional com timeline |
| **Habilidades** | Mapa de skills categorizado com nível de proficiência (%) |
| **Contato** | Email, WhatsApp, LinkedIn, GitHub |
| **Currículo PDF** | Export automático do portfólio em PDF via `html2pdf.js` |

### 🤖 Geração de Conteúdo com IA (Gemini 2.0 Flash)

- **Artigos técnicos completos**: Título, slug, conteúdo HTML, excerpt, tags, tempo de leitura e prompt para capa
- **Tutoriais passo a passo**: Estrutura completa com código, dificuldade e duração estimada
- **Roadmaps de carreira personalizados**: Com dependências entre etapas, objetivos de aprendizado e projetos sugeridos
- **Sugestão de projetos práticos**: Análise das tecnologias da etapa para sugerir um projeto adequado ao nível
- **Análise de repositórios GitHub**: A IA lê o README, commits e linguagens para gerar uma descrição executiva do projeto
- **Análise de soft skills**: Com base nos artigos, projetos e experiências cadastrados, a IA infere e pontua habilidades comportamentais
- **Análise de habilidades técnicas**: Extração automática de skills dos dados do portfólio com categorização e nível percentual
- **Descrição de perfil**: Geração de bio personalizada com base na persona do usuário
- **Geração de imagens de capa**: Via Google Imagen 4 (aspect ratio 16:9)

### 🎓 Sistema de Roadmap Interativo

- Trilhas de aprendizado com rastreamento visual de progresso
- Verificação de **dependências entre etapas** (uma etapa só é desbloqueada após as anteriores)
- Validação por **Quiz obrigatório** com score mínimo de 80%
- Após aprovação, botões de geração desbloqueados para: artigo, tutorial e projeto
- Habilidades aprendidas são automaticamente injetadas no perfil de skills do usuário
- Suporte a **múltiplos roadmaps simultâneos** com seletor de objetivo ativo

### 📊 Analytics do Portfólio

- Contagem de visualizações por artigo e tutorial
- Segmentação por origem de tráfego (WhatsApp, LinkedIn, Google, Direct, etc.)
- Detecção de bots vs visitantes humanos
- Timeline de acessos por data
- Ranking dos conteúdos mais acessados

### 🔗 Compartilhamento Social Otimizado

- Links de compartilhamento com Open Graph completo (Facebook, LinkedIn, Twitter)
- Imagens `og:image` de 1200x630px para LinkedIn
- Endpoint de debug para validar meta tags antes de postar
- Redirecionamento inteligente com preservação de UTM params

---

## 🚀 Nexus Sprint — O Diferencial

O **Nexus Sprint** é a funcionalidade central e mais estratégica da plataforma. Ele transforma o moises.work de um gerador de portfólio passivo em um **Acelerador de Contratação Ativo**.

### O Problema que Resolve

> Um desenvolvedor Sênior em React excelente é descartado porque a vaga exige "Docker" e ele não tem essa palavra-chave no currículo.

### Como Funciona

```
1. Usuário cola a descrição da vaga
       ↓
2. IA extrai e normaliza as skills exigidas (com níveis 0-1)
       ↓
3. Algoritmo compara com o vetor de habilidades do usuário
       ↓
4. Cálculo do GAP por distância euclidiana
       ↓
5. Geração de Roadmap cirúrgico focado EXCLUSIVAMENTE nas lacunas
       ↓
6. Opção de salvar a trilha e executá-la no sistema de Roadmaps
```

### A Matemática por Trás

O sistema representa vagas e usuários como **vetores n-dimensionais** (cada dimensão = uma skill). O gap é calculado pela diferença entre os vetores:

```
Usuário:  { node: 0.9, docker: 0.1, sql: 0.8 }
Vaga:     { node: 0.8, docker: 0.8, sql: 0.7 }
GAP:      { node: 0.0, docker: 0.7, sql: 0.0 }

Compatibilidade: ~73% → Sprint foca em Docker
```

### Matching Inteligente de Skills

O serviço `nexus-sprint.service.ts` implementa normalização avançada antes de comparar:

- Remove versões (`ES6+`, `v2/3`, `v3.x`)
- Remove sufixos genéricos (`APIs`, `Toolkit`)
- Matching exato **e** parcial (substring) após normalização
- Evita falsos positivos com strings muito curtas (< 3 chars)

### Output da Análise

- **Percentual de compatibilidade** com barra de progresso visual
- **Skills totalmente ausentes** (prioridade máxima)
- **Skills abaixo do nível exigido** com delta percentual (atual → necessário)
- **Trilha de Aprendizado gerada** com ancoragem cognitiva nas skills existentes
- Botão para **salvar como Roadmap** e executar no sistema integrado

---

## 🏗️ Arquitetura e Stack

### Visão Geral

```
┌─────────────────────────────────────────────┐
│              Firebase Hosting               │
│         (CDN + Rewrites Inteligentes)       │
└──────────────┬──────────────────────────────┘
               │
       ┌───────┴───────┐
       │               │
┌──────▼──────┐  ┌─────▼───────────────────────┐
│  Frontend   │  │    Firebase Cloud Functions  │
│  Vue 3 SPA  │  │                             │
│             │  │  /api   → Express API        │
│  • Portfólio│  │  /link  → OG Meta / Share    │
│  • Admin    │  │  /payment → Proxy PIX        │
│  • Nexus    │  │                             │
└──────┬──────┘  └─────┬───────────────────────┘
       │               │
       └───────┬───────┘
               │
       ┌───────▼───────────────┐
       │  Firebase Realtime DB │
       │  Firebase Auth        │
       │  Firebase Storage     │
       └───────────────────────┘
               │
       ┌───────▼───────┐
       │  Google Gemini │
       │  2.0 Flash     │
       │  Imagen 4      │
       └───────────────┘
```

### Stack Completa

| Camada | Tecnologia | Versão |
|---|---|---|
| **Frontend Framework** | Vue.js | 3.x (Composition API) |
| **Build Tool** | Vite | 4.x |
| **Linguagem** | TypeScript | 5.x |
| **Estado** | Pinia | 3.x |
| **Roteamento** | Vue Router | 4.x |
| **Estilização** | Sass / CSS Modules | — |
| **Testes** | Vitest + Vue Test Utils | 4.x |
| **Backend** | Express.js | 4.x |
| **Serverless** | Firebase Cloud Functions | Node 22 |
| **Banco de dados** | Firebase Realtime Database | — |
| **Autenticação** | Firebase Auth (Google OAuth) | — |
| **Storage** | Firebase Storage | — |
| **IA — Texto** | Google Gemini 2.0 Flash | — |
| **IA — Imagem** | Google Imagen 4 | — |
| **Pagamentos** | PIX (proxy via Cloud Function) | — |
| **Markdown** | marked + highlight.js | — |
| **PDF Export** | html2pdf.js | — |
| **TTS** | Web Speech API | Nativa |

---

## 📂 Estrutura do Monorepo

```
moises-work/
├── packages/
│   │
│   ├── frontend/                    # Aplicação Vue 3 (SPA)
│   │   ├── src/
│   │   │   ├── assets/              # CSS global, temas, estilos admin
│   │   │   ├── components/          # Componentes reutilizáveis
│   │   │   │   ├── AboutSummary.vue
│   │   │   │   ├── CVModal.vue      # Export PDF do portfólio
│   │   │   │   ├── ProjectCard.vue
│   │   │   │   ├── TheHeader.vue
│   │   │   │   ├── TheFooter.vue
│   │   │   │   ├── TheToast.vue     # Sistema de notificações
│   │   │   │   └── ThemeSwitcher.vue
│   │   │   │
│   │   │   ├── firebase/
│   │   │   │   └── config.ts        # Inicialização do Firebase SDK
│   │   │   │
│   │   │   ├── layouts/
│   │   │   │   ├── PortfolioLayout.vue   # Layout público do portfólio
│   │   │   │   └── UnifiedLayout.vue    # Layout do painel admin
│   │   │   │
│   │   │   ├── router/
│   │   │   │   └── index.ts         # Rotas públicas e admin com guards
│   │   │   │
│   │   │   ├── sdk/
│   │   │   │   ├── AppSDK.ts        # SDK agnóstico (Créditos, PIX, Indicação, Geração)
│   │   │   │   ├── GitHubSDK.ts     # Client da API do GitHub
│   │   │   │   └── index.ts         # Instância configurada do SDK
│   │   │   │
│   │   │   ├── services/
│   │   │   │   ├── api.gemini.service.ts    # Client da API de IA
│   │   │   │   ├── api.analytics.service.ts
│   │   │   │   ├── auth.service.ts          # Gerenciamento de tokens
│   │   │   │   ├── nexus-sprint.service.ts  # Motor do Nexus Sprint
│   │   │   │   ├── storage.service.ts       # Upload de imagens
│   │   │   │   └── tts.service.ts           # Text-to-Speech
│   │   │   │
│   │   │   ├── stores/              # Gerenciamento de estado (Pinia)
│   │   │   │   ├── ai.ts            # Ações de geração com IA
│   │   │   │   ├── analytics.ts     # Dados de analytics
│   │   │   │   ├── auth.ts          # Autenticação
│   │   │   │   ├── portfolios.ts    # Dados do portfólio (fonte da verdade)
│   │   │   │   ├── ui.ts            # Estado da interface (loading, toast, tema)
│   │   │   │   └── user.ts          # Créditos e dados do usuário
│   │   │   │
│   │   │   ├── utils/
│   │   │   │   └── slug.ts          # kebabCase com normalização de acentos
│   │   │   │
│   │   │   └── views/
│   │   │       ├── admin/           # Painel administrativo
│   │   │       │   ├── about/       # Edição de perfil + persona da IA
│   │   │       │   ├── articles/    # CRUD de artigos + geração IA
│   │   │       │   ├── contact/     # Informações de contato
│   │   │       │   ├── credits/     # Compra de créditos via PIX + indicação
│   │   │       │   ├── dashboard/   # Painel de analytics
│   │   │       │   ├── experiences/ # CRUD de experiências profissionais
│   │   │       │   ├── nexus-sprint/# Motor de análise de vagas
│   │   │       │   │   ├── NexusSprint.vue      # Input da vaga
│   │   │       │   │   ├── AnalysisList.vue     # Histórico de análises
│   │   │       │   │   ├── AnalysisDetails.vue  # Detalhes + geração de trilha
│   │   │       │   │   └── components/
│   │   │       │   │       ├── GapAnalysis.vue
│   │   │       │   │       └── JobInput.vue
│   │   │       │   ├── projects/    # CRUD de projetos + integração GitHub
│   │   │       │   ├── roadmap/     # Roadmaps interativos + soft skills
│   │   │       │   ├── skills/      # Mapa de habilidades técnicas
│   │   │       │   └── tutorials/   # CRUD de tutoriais + geração IA
│   │   │       │
│   │   │       ├── auth/
│   │   │       │   └── Login.vue    # Login com Google OAuth
│   │   │       │
│   │   │       ├── portfolio/       # Portfólio público (rotas dinâmicas /:slug)
│   │   │       │   ├── Home.vue
│   │   │       │   ├── About.vue
│   │   │       │   ├── Experience.vue
│   │   │       │   ├── Skills.vue
│   │   │       │   ├── Projects.vue
│   │   │       │   ├── Project.vue  # Detalhes com dados do GitHub em tempo real
│   │   │       │   ├── Blog.vue
│   │   │       │   ├── Article.vue  # Artigo com TTS e compartilhamento
│   │   │       │   ├── Tutorials.vue
│   │   │       │   ├── Tutorial.vue
│   │   │       │   └── Contact.vue
│   │   │       │
│   │   │       └── LandingPage.vue  # Feed público da comunidade
│   │   │
│   │   ├── index.html
│   │   ├── tsconfig.json
│   │   ├── vite.config.ts
│   │   └── vitest.config.ts
│   │
│   ├── functions/                   # Backend Firebase (Node.js 22)
│   │   └── src/
│   │       ├── api/                 # API principal
│   │       │   ├── app.ts           # Express app com middlewares
│   │       │   └── src/
│   │       │       ├── controllers/
│   │       │       │   ├── gemini.controller.ts    # Endpoints de IA
│   │       │       │   └── analytics.controller.ts
│   │       │       ├── middlewares/
│   │       │       │   ├── auth.middleware.ts       # Validação Firebase JWT
│   │       │       │   └── rateLimit.middleware.ts  # 10 req/min por usuário
│   │       │       ├── routes/
│   │       │       │   ├── gemini.routes.ts
│   │       │       │   └── analytics.routes.ts
│   │       │       └── services/
│   │       │           ├── gemini.service.ts        # Integração Google Gemini
│   │       │           └── credits.service.ts       # Transações atômicas de crédito
│   │       │
│   │       ├── link/                # Função de compartilhamento e OG tags
│   │       │   ├── app.ts
│   │       │   └── src/
│   │       │       ├── controllers/
│   │       │       │   └── link.controller.ts      # OG meta, analytics, redirect
│   │       │       └── routes/
│   │       │           └── link.routes.ts
│   │       │
│   │       ├── payment/             # Proxy de pagamentos PIX
│   │       │   └── index.ts
│   │       │
│   │       ├── configs/
│   │       │   └── firebase.ts      # Inicialização do Admin SDK
│   │       │
│   │       └── index.ts             # Entry point das Cloud Functions
│   │
│   └── shared/                      # Tipos TypeScript compartilhados
│       ├── index.ts                 # Project, Article, Tutorial, Skill, Experience
│       └── package.json
│
├── firebase.json                    # Rewrites, hosting targets, runtime
├── package.json                     # Configuração raiz do monorepo
└── README.md
```

---

## 🧠 Fluxo de IA

### Geração de Conteúdo (Protegida por Créditos)

```
Frontend (Vue)                Backend (Cloud Function)
     │                                │
     │─── POST /v1/gemini/generate ──►│
     │         + Bearer Token         │
     │                                │──► auth.middleware (valida JWT)
     │                                │──► rateLimit.middleware (10/min)
     │                                │──► creditsService.deductCredits() ← ATÔMICO
     │                                │
     │                                │──► geminiService.generate()
     │                                │         ↓
     │                                │    [FALHA] creditsService.refundCredits()
     │                                │
     │◄── JSON estruturado ──────────│
     │                                │
     │──► salva no Realtime DB ───────┘
```

### Transações de Crédito (Firebase Realtime DB Transaction)

O sistema usa **transações atômicas** do Firebase para evitar race conditions:

1. Verifica se o plano diário está ativo e com saldo
2. Prioriza débito do plano diário
3. Fallback para créditos regulares
4. Em caso de falha na IA → **reembolso automático**
5. Todo gasto é registrado no histórico de `spendingHistory`

### Hierarquia de Créditos

```
Requisição de geração
       │
       ▼
┌─────────────────┐   SIM   ┌──────────────────────┐
│ Plano Diário    │────────►│ Débita dailyCredits   │
│ Ativo e Saldo?  │         └──────────────────────┘
└────────┬────────┘
         │ NÃO
         ▼
┌─────────────────┐   SIM   ┌──────────────────────┐
│ Créditos        │────────►│ Débita credits        │
│ Regulares       │         └──────────────────────┘
└────────┬────────┘
         │ NÃO
         ▼
   Retorna 403 (Saldo Insuficiente)
```

---

## 💰 Sistema de Créditos e Monetização

### Custos por Funcionalidade

| Funcionalidade | Custo |
|---|---|
| Gerar Artigo | 2 créditos |
| Gerar Tutorial | 3 créditos |
| Gerar Roadmap | 5 créditos |
| Gerar Projeto / Análise GitHub | 4 créditos |
| Análise de Soft Skills | 2 créditos |
| Análise de Habilidades | 2 créditos |
| Gerar Quiz | 1 crédito |
| Gerar Texto (genérico) | 1 crédito |
| Gerar Imagem (Imagen 4) | 4 créditos |

### Planos de Créditos (via PIX)

| Plano | Créditos | Preço |
|---|---|---|
| Iniciante | 10 | R$ 9,90 |
| Profissional | 50 | R$ 29,90 |
| Expert | 100 | R$ 49,90 |

### Créditos Gratuitos

- **Bônus de boas-vindas**: 10 créditos ao criar conta
- **Bônus mensal**: 10 créditos a cada 30 dias
- **Programa de indicação**: 10 créditos para o indicador quando o indicado faz a primeira compra; 10 créditos para o indicado também

### Infraestrutura de Pagamento

Pagamentos processados via **PIX** com polling automático de status:
- Cloud Function `/payment` funciona como proxy seguro para a API externa
- Polling a cada 5 segundos por até 10 minutos
- Créditos adicionados automaticamente após confirmação
- Processamento automático de bônus de indicação na primeira compra

---

## 🚀 Como Executar

### Pré-requisitos

- **Node.js** v18+ (recomendado v22 para paridade com produção)
- **NPM** v9+
- **Firebase CLI**: `npm install -g firebase-tools`
- Conta no **Firebase** com projeto criado
- **API Key** do Google Gemini (Google AI Studio)

### 1. Clone e Instale

```bash
git clone https://github.com/seu-usuario/moises-work.git
cd moises-work
npm install
```

### 2. Configure o Firebase

```bash
firebase login
firebase use --add   # Selecione seu projeto Firebase
```

### 3. Configure as Variáveis de Ambiente

#### Frontend — crie `packages/frontend/.env`:

```env
VITE_FIREBASE_API_KEY=sua_api_key
VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://seu-projeto-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=seu-projeto
VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
VITE_FIREBASE_APP_ID=sua_app_id
VITE_API_URL=https://api-seu-projeto.a.run.app
```

#### Backend — configure a secret do Gemini:

```bash
firebase functions:secrets:set GEMINI_KEY
# Digite sua API Key quando solicitado
```

> ⚠️ **Atenção**: O projeto usa `defineSecret` do Firebase Functions v2, que armazena a chave no Google Secret Manager. Não use `functions:config:set` para a chave do Gemini.

### 4. Execute Localmente

```bash
# Frontend (porta 5173)
npm run dev --workspace=frontend

# Backend (emulador Firebase — porta 5001)
npm run serve --workspace=functions
```

> Para desenvolvimento local com o backend, configure a URL da API no `.env` do frontend para apontar para o emulador: `VITE_API_URL=http://127.0.0.1:5001/seu-projeto/us-central1`

---

## 🔧 Variáveis de Ambiente

### Frontend (`packages/frontend/.env`)

| Variável | Obrigatória | Descrição |
|---|---|---|
| `VITE_FIREBASE_API_KEY` | ✅ | Chave da API do Firebase |
| `VITE_FIREBASE_AUTH_DOMAIN` | ✅ | Domínio de autenticação |
| `VITE_FIREBASE_DATABASE_URL` | ✅ | URL do Realtime Database |
| `VITE_FIREBASE_PROJECT_ID` | ✅ | ID do projeto Firebase |
| `VITE_FIREBASE_STORAGE_BUCKET` | ✅ | Bucket do Storage |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | ✅ | Sender ID do Firebase |
| `VITE_FIREBASE_APP_ID` | ✅ | App ID do Firebase |
| `VITE_API_URL` | ✅ | URL base da Cloud Function API |

### Backend (Firebase Secret Manager)

| Secret | Obrigatória | Descrição |
|---|---|---|
| `GEMINI_KEY` | ✅ | API Key do Google Gemini (AI Studio) |

---

## 📜 Scripts Disponíveis

Na raiz do monorepo:

```bash
npm run dev            # Frontend em modo desenvolvimento
npm run build          # Build de produção do frontend
npm run dev:admin      # Painel admin em modo desenvolvimento
npm run build:admin    # Build do admin
npm run dev:all        # Frontend + Admin simultâneos
npm run deploy         # Deploy completo (Hosting + Functions)
```

Nos workspaces individuais:

```bash
# Frontend
npm run test --workspace=frontend      # Testes interativos (Vitest)
npm run test:run --workspace=frontend  # Testes em modo CI
npm run coverage --workspace=frontend  # Relatório de cobertura

# Functions
npm run build --workspace=functions    # Compila TypeScript
npm run serve --workspace=functions    # Emulador local
```

---

## 🧪 Testes

O projeto usa **Vitest** com **Vue Test Utils** para testes unitários e de componentes.

```bash
# Rodar todos os testes
npm run test:run --workspace=frontend

# Modo watch (desenvolvimento)
npm run test:watch --workspace=frontend

# Interface visual do Vitest
npm run test:ui --workspace=frontend

# Cobertura de código (Istanbul)
npm run coverage --workspace=frontend
```

### Estrutura dos Testes

```
packages/frontend/src/test/
├── components/
│   └── ProjectCard.spec.ts      # Testes do componente de projeto
├── stores/
│   └── ui.spec.ts               # Testes da store de UI
├── utils/
│   └── slug.spec.ts             # Testes do utilitário de slug
└── example/
    └── ArticleView.spec.ts      # Exemplo de teste de view
```

---

## 🚀 Deploy

### Deploy Completo

```bash
npm run deploy
# ou
firebase deploy --only hosting,functions
```

### Deploy Parcial

```bash
# Apenas frontend
firebase deploy --only hosting:moises-work-app

# Apenas backend
firebase deploy --only functions
```

### Targets de Hosting

O `firebase.json` configura um target de hosting (`moises-work-app`) com rewrites inteligentes:

| Rota | Destino |
|---|---|
| `/api/**` | Cloud Function `api` |
| `/payment/**` | Cloud Function `payment` |
| `/share/**` | Cloud Function `link` (OG meta tags) |
| `/:slug/artigo/:slug` | Cloud Function `link` (OG meta tags) |
| `/:slug/tutorial/:slug` | Cloud Function `link` (OG meta tags) |
| `**` | `index.html` (SPA fallback) |

---

## 🔒 Segurança

- **Autenticação**: Todos os endpoints da API exigem token Firebase JWT válido (`auth.middleware.ts`)
- **Rate Limiting**: 10 requisições por minuto por usuário nas rotas Gemini (`rateLimit.middleware.ts`)
- **Transações Atômicas**: Débito de créditos via Firebase Transaction para evitar race conditions
- **Rollback Automático**: Se a IA falhar após débito, o reembolso é feito automaticamente
- **Sanitização**: Dados do Firebase sanitizados antes de escrita (remoção de `__proto__`, `constructor`)
- **XSS Prevention**: Escape de HTML em todas as meta tags geradas pelo `link.controller.ts`
- **Secrets**: API Key do Gemini armazenada no Google Secret Manager (nunca exposta no código)

---

## 🤝 Contribuição

Contribuições são muito bem-vindas! Siga o fluxo abaixo:

1. **Fork** o repositório
2. **Crie** uma branch descritiva:
   ```bash
   git checkout -b feature/nexus-sprint-quiz-validation
   # ou
   git checkout -b fix/credits-race-condition
   ```
3. **Commit** seguindo o padrão Conventional Commits:
   ```bash
   git commit -m "feat: adiciona validação de quiz no Nexus Sprint"
   git commit -m "fix: corrige race condition no débito de créditos"
   git commit -m "docs: atualiza README com variáveis de ambiente"
   ```
4. **Push** para sua branch:
   ```bash
   git push origin feature/nexus-sprint-quiz-validation
   ```
5. **Abra um Pull Request** descrevendo as mudanças e o problema resolvido

### Padrão de Commits

| Tipo | Uso |
|---|---|
| `feat` | Nova funcionalidade |
| `fix` | Correção de bug |
| `docs` | Documentação |
| `refactor` | Refatoração sem mudança de comportamento |
| `test` | Adição ou correção de testes |
| `chore` | Tarefas de manutenção (deps, config) |

---

## 📄 Licença

Distribuído sob a licença **MIT**. Veja o arquivo `LICENSE` para mais informações.

---

<p align="center">
  Feito com ❤️ por <a href="https://github.com/moisesfelix">Moisés Felix</a>
</p>