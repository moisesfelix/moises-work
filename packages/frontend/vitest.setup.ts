import { config } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { vi } from 'vitest'

// Configuração global do Vue Test Utils
config.global.stubs = {}

// Mock global do Firebase (pode ser expandido conforme necessidade)
vi.mock('@/firebase/config', () => ({
  db: {},
  storage: {},
  auth: {},
}))

// Mock do storage service para evitar uploads reais
vi.mock('@/services/storage.service', () => ({
  storageService: {
    uploadImage: vi.fn(() => Promise.resolve('fake-image-url')),
    deleteImage: vi.fn(() => Promise.resolve()),
  },
}))

// Fornece um store de teste globalmente (opcional)
// import { setActivePinia } from 'pinia'
// setActivePinia(createTestingPinia())
