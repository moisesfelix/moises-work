import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import Article from '@/views/portfolio/Article.vue'

// Mock da store de portfólios
vi.mock('@/stores/portfolios', () => ({
  usePortfoliosStore: vi.fn(() => ({
    getArticleBySlug: vi.fn(() => ({
      title: 'Artigo de Teste',
      content: '<p>Conteúdo</p>',
      date: '2025-03-20',
      readTime: '5 min',
      category: 'Tecnologia',
      tags: ['vue', 'test'],
      image: 'fake.jpg',
      codeBlocks: [],
    })),
    activePortfolioId: 'test-id',
  })),
}))

// Mock do ttsService
vi.mock('@/services/tts.service', () => ({
  ttsService: {
    speak: vi.fn(),
    cancel: vi.fn(),
    isSpeaking: vi.fn(() => false),
  },
}))

describe('Article.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renderiza o artigo mockado', async () => {
    const router = createRouter({
      history: createWebHistory(),
      routes: [{ path: '/:slug/artigo/:articleSlug', component: Article }],
    })
    router.push('/test/artigo/test-article')
    await router.isReady()

    const wrapper = mount(Article, {
      global: {
        plugins: [router],
        stubs: ['router-link', 'router-view'],
      },
    })

    // Aguarda a renderização
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Artigo de Teste')
    expect(wrapper.text()).toContain('Conteúdo')
  })
})
