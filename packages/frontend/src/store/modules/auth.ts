
import type { Module } from 'vuex';
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';

interface AuthState {
  user: any | null;
}

const authModule: Module<AuthState, any> = {
  namespaced: true,
  state: {
    user: null,
  },
  mutations: {
    setUser(state, user: any) {
      state.user = user;
    },
    clearUser(state) {
      state.user = null;
    },
  },
  actions: {
    async login({ commit }, { email, password }) {
      commit('ui/setLoading', true, { root: true });
      commit('ui/setError', null, { root: true });

      try {
        const auth = getAuth();
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        commit('setUser', user);
        return user;
      } catch (error: any) {
        commit('ui/setError', error.message, { root: true });
        throw error;
      } finally {
        commit('ui/setLoading', false, { root: true });
      }
    },

    async logout({ commit }) {
      commit('ui/setLoading', true, { root: true });
      try {
        const auth = getAuth();
        await signOut(auth);
        commit('clearUser');
      } catch (error: any) {
        commit('ui/setError', error.message, { root: true });
        throw error;
      } finally {
        commit('ui/setLoading', false, { root: true });
      }
    },
  },
  getters: {
    isAuthenticated: (state) => !!state.user,
    currentUser: (state) => state.user,
  },
};

export default authModule;
