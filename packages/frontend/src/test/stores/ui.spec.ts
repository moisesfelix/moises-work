import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUiStore } from '@/stores/ui'

describe('UiStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    // limpa localStorage
    localStorage.clear()
  })

  it('tema inicial é dark (padrão)', () => {
    const store = useUiStore()
    expect(store.currentTheme).toBe('dark')
  })

  it('toggleTheme alterna entre dark e light', () => {
    const store = useUiStore()
    expect(store.currentTheme).toBe('dark')
    store.toggleTheme()
    expect(store.currentTheme).toBe('light')
    store.toggleTheme()
    expect(store.currentTheme).toBe('dark')
  })

  it('setTheme altera o tema e salva no localStorage', () => {
    const store = useUiStore()
    store.setTheme('light')
    expect(store.currentTheme).toBe('light')
    expect(localStorage.getItem('theme')).toBe('light')
    expect(document.documentElement.className).toBe('light-theme')
  })

  it('setError e setLoading funcionam', () => {
    const store = useUiStore()
    expect(store.isLoading).toBe(false)
    store.setLoading(true)
    expect(store.isLoading).toBe(true)
    store.setError('Erro de teste')
    expect(store.error).toBe('Erro de teste')
  })

  it('triggerToast mostra e esconde toast após duration', () => {
    vi.useFakeTimers()
    const store = useUiStore()
    store.triggerToast({ message: 'Teste', type: 'success', duration: 1000 })
    expect(store.toast.show).toBe(true)
    expect(store.toast.message).toBe('Teste')
    vi.advanceTimersByTime(1000)
    expect(store.toast.show).toBe(false)
    vi.useRealTimers()
  })
})
