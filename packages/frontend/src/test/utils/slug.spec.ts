import { describe, it, expect } from 'vitest'
import { kebabCase } from '@/utils/slug'

describe('kebabCase', () => {
  it('converte espaços e underlines para hífen', () => {
    expect(kebabCase('Meu Portfólio')).toBe('meu-portfolio')
    expect(kebabCase('meu_portfolio')).toBe('meu-portfolio')
  })

  it('remove acentos', () => {
    expect(kebabCase('João Silva')).toBe('joao-silva')
    expect(kebabCase('coração')).toBe('coracao')
  })

  it('lida com strings vazias', () => {
    expect(kebabCase('')).toBe('')
  })

  it('remove caracteres não alfanuméricos', () => {
    expect(kebabCase('Projeto #1!')).toBe('projeto-1')
  })

  it('converte camelCase para kebab-case', () => {
    expect(kebabCase('myProjectName')).toBe('my-project-name')
  })
})
