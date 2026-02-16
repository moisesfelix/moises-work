import { getAuth, onAuthStateChanged, type User, getIdToken } from 'firebase/auth';
import { app } from '@/firebase/config'; // Assumindo que você tem um arquivo central de firebase no frontend

class AuthService {
  private auth = getAuth(app);
  private _currentUser: User | null = null;
  private tokenPromise: Promise<string | null> | null = null;

  constructor() {
    onAuthStateChanged(this.auth, (user) => {
      this._currentUser = user;
    });
  }

  get currentUser(): User | null {
    return this.auth.currentUser;
  }

  /**
   * Obtém o token de autenticação atual.
   * Se forceRefresh for true, força a renovação do token.
   */
  async getToken(forceRefresh = false): Promise<string | null> {
    const user = this.auth.currentUser;
    if (!user) return null;

    try {
      return await getIdToken(user, forceRefresh);
    } catch (error) {
      console.error('AuthService: Erro ao obter token', error);
      return null;
    }
  }

  /**
   * Retorna o header Authorization pronto para uso em fetch/axios
   */
  async getAuthHeader(): Promise<{ Authorization: string } | {}> {
    const token = await this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
}

export const authService = new AuthService();
