import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ProjectCard from '@/components/ProjectCard.vue'

describe('ProjectCard.vue', () => {
  const mockProject = {
    id: '1',
    title: 'Projeto Teste',
    description: 'Descrição do projeto',
    image: 'https://via.placeholder.com/300',
    tags: ['Vue', 'TypeScript'],
    githubUrl: 'https://github.com',
  }

  it('renderiza título e descrição', () => {
    const wrapper = mount(ProjectCard, {
      props: { project: mockProject },
    })
    expect(wrapper.text()).toContain('Projeto Teste')
    expect(wrapper.text()).toContain('Descrição do projeto')
  })

  it('renderiza as tags', () => {
    const wrapper = mount(ProjectCard, {
      props: { project: mockProject },
    })
    const tags = wrapper.findAll('.tech-tag')
    expect(tags).toHaveLength(2)
    expect(tags[0].text()).toBe('Vue')
    expect(tags[1].text()).toBe('TypeScript')
  })

  it('exibe link do GitHub quando fornecido', () => {
    const wrapper = mount(ProjectCard, {
      props: { project: mockProject },
    })
    const githubLink = wrapper.find('.btn-link[title="Ver código no GitHub"]')
    expect(githubLink.exists()).toBe(true)
    expect(githubLink.attributes('href')).toBe('https://github.com')
  })
})
