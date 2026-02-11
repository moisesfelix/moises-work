import type { Module } from 'vuex';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { db } from '@/firebase/config';
import { ref, get, set, serverTimestamp } from 'firebase/database';

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
    async loginWithGoogle({ commit }) {
      commit('ui/setLoading', true, { root: true });
      commit('ui/setError', null, { root: true });

      try {
        const auth = getAuth();
        const provider = new GoogleAuthProvider();
        const userCredential = await signInWithPopup(auth, provider);
        const user = userCredential.user;
        
        // Create user record in DB if not exists
        const userRef = ref(db, `users/${user.uid}`);
        const userSnap = await get(userRef);
        
        if (!userSnap.exists()) {
          await set(userRef, {
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            createdAt: serverTimestamp()
          });
        }
        
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
