import { createStore } from 'vuex'

const store = createStore({
  state() {
    return {
      projects: [
        {
          id: 1,
          title: 'Project 1',
          description: 'This is a web project.',
          image: 'https://via.placeholder.com/300',
          tags: ['Vue', 'Vite'],
          category: ['web', 'fullstack']
        },
        {
          id: 2,
          title: 'Project 2',
          description: 'This is a mobile project.',
          image: 'https://via.placeholder.com/300',
          tags: ['React Native', 'Firebase'],
          category: ['mobile']
        },
        {
          id: 3,
          title: 'Project 3',
          description: 'This is an AI project.',
          image: 'https://via.placeholder.com/300',
          tags: ['Python', 'TensorFlow'],
          category: ['ai']
        }
      ]
    }
  },
  mutations: {
    // your mutations
  },
  actions: {
    // your actions
  },
  getters: {
    // your getters
  }
})

export default store
