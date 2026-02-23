export class GitHubRepoSDK {
    owner: string;
    repo: string;
    baseUrl: string;
    headers: any;
  
    constructor(owner: string, repo: string, token: string | null = null) {
      this.owner = owner;
      this.repo = repo;
      this.baseUrl = `https://api.github.com/repos/${owner}/${repo}`;
      this.headers = token
        ? { Authorization: `Bearer ${token}` }
        : {};
    }
  
    async request(endpoint: string) {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: this.headers,
      });
      if (!response.ok) {
        throw new Error(`GitHub API Error: ${response.status}`);
      }
      return response.json();
    }
  
    // 📌 Info do repositório
    getRepoInfo() {
      return this.request("");
    }
  
    // 📌 Commits
    getCommits(params: any = {}) {
      const query = new URLSearchParams(params).toString();
      return this.request(`/commits${query ? `?${query}` : ""}`);
    }
  
    // 📌 README (Base64 -> String)
    async getReadme() {
      try {
        const data = await this.request("/readme");
        // Decodifica Base64, lidando com caracteres especiais (UTF-8)
        const decoded = decodeURIComponent(escape(window.atob(data.content.replace(/\n/g, ""))));
        return {
          ...data,
          decoded,
        };
      } catch (e) {
        console.warn("README não encontrado ou erro ao decodificar");
        return { decoded: "" };
      }
    }
  
    // 📌 Linguagens
    getLanguages() {
      return this.request("/languages");
    }
  
    // 📌 Contributors
    getContributors() {
      return this.request("/contributors");
    }
  }
  
  export const GithubUtils = {
    parseUrl(url: string) {
      try {
        const urlObj = new URL(url);
        const parts = urlObj.pathname.split('/').filter(p => p);
        if (parts.length >= 2) {
          return { owner: parts[0], repo: parts[1] };
        }
      } catch (e) {
        return null;
      }
      return null;
    }
  };