import type { Module } from 'vuex';
import { db } from '@/firebase/config';
import { ref, get, query, limitToLast } from 'firebase/database';

export interface AnalyticsState {
  loading: boolean;
  error: string | null;
  data: {
    summary: {
      total: number;
      articles: number;
      tutorials: number;
      human: number;
      bot: number;
    };
    topContent: any[];
    timeline: any[];
    referrers: any[];
  } | null;
}

const analyticsModule: Module<AnalyticsState, any> = {
  namespaced: true,
  state: {
    loading: false,
    error: null,
    data: null
  },
  mutations: {
    setLoading(state, loading: boolean) {
      state.loading = loading;
    },
    setError(state, error: string | null) {
      state.error = error;
    },
    setData(state, data) {
      state.data = data;
    }
  },
  actions: {
    async fetchAnalytics({ commit, rootState }) {
      const portfolioId = rootState.portfolios.activePortfolioId;
      if (!portfolioId) {
        commit('setError', 'Nenhum portfólio ativo.');
        return;
      }

      commit('setLoading', true);
      commit('setError', null);

      try {
        // Buscar os últimos 12 meses de dados (ou todos se preferir, mas cuidado com volume)
        // A estrutura é portfolios_analytics/{portfolioId}/{YYYY-MM}/{pushId}
        const analyticsRef = query(
            ref(db, `portfolios_analytics/${portfolioId}`), 
            limitToLast(12)
        );
        
        const snapshot = await get(analyticsRef);

        if (!snapshot.exists()) {
          commit('setData', {
            summary: { total: 0, articles: 0, tutorials: 0, human: 0, bot: 0 },
            topContent: [],
            timeline: [],
            referrers: []
          });
          return;
        }

        const data = snapshot.val();
        
        // Achatar todos os meses em um único array de entradas
        let allEntries: any[] = [];
        Object.keys(data).forEach(monthKey => {
            const monthData = data[monthKey];
            if (monthData) {
                const monthEntries = Object.values(monthData);
                allEntries = allEntries.concat(monthEntries);
            }
        });

        // Processamento (Lógica movida do backend para cá)
        const stats = {
            totalViews: allEntries.length,
            byType: { article: 0, tutorial: 0 } as Record<string, number>,
            bySlug: {} as Record<string, { title: string, count: number, type: string }>,
            byDate: {} as Record<string, number>,
            referrers: {} as Record<string, number>,
            devices: { bot: 0, user: 0 }
        };

        allEntries.forEach(entry => {
            // Count by Type
            if (entry.type) {
                stats.byType[entry.type] = (stats.byType[entry.type] || 0) + 1;
            }

            // Count by Slug
            if (entry.slug) {
                if (!stats.bySlug[entry.slug]) {
                    stats.bySlug[entry.slug] = { 
                        title: entry.slug, 
                        count: 0, 
                        type: entry.type 
                    };
                }
                stats.bySlug[entry.slug].count++;
            }

            // Count by Date
            let dateKey = 'Unknown';
            if (entry.timestamp) {
                dateKey = new Date(entry.timestamp).toISOString().split('T')[0];
            } else if (entry.isoDate) {
                dateKey = entry.isoDate.split('T')[0];
            }
            stats.byDate[dateKey] = (stats.byDate[dateKey] || 0) + 1;

            // Count Referrers / Source Logic
            let source = 'Direct';

            // 1. Prioridade: Parâmetros UTM (Padrão de mercado para campanhas/social)
            if (entry.utm && entry.utm.source) {
                source = entry.utm.source;
                // Capitalizar primeira letra
                source = source.charAt(0).toUpperCase() + source.slice(1);
            } 
            else {
                // 2. Tenta detectar pelo User Agent (Apps Mobile frequentemente não enviam referer, mas se identificam no UA)
                let uaSource = null;
                if (entry.userAgent) {
                    const ua = entry.userAgent.toLowerCase();
                    if (ua.includes('whatsapp')) uaSource = 'WhatsApp';
                    else if (ua.includes('instagram')) uaSource = 'Instagram';
                    else if (ua.includes('telegram')) uaSource = 'Telegram';
                    else if (ua.includes('linkedin') || ua.includes('linkedinbot')) uaSource = 'LinkedIn';
                    else if (ua.includes('fban') || ua.includes('fbav') || ua.includes('facebook')) uaSource = 'Facebook';
                    else if (ua.includes('twitter') || ua.includes('twitterbot')) uaSource = 'X (Twitter)';
                    else if (ua.includes('tiktok')) uaSource = 'TikTok';
                    else if (ua.includes('pinterest')) uaSource = 'Pinterest';
                }

                if (uaSource) {
                    source = uaSource;
                } 
                // 3. Fallback: Cabeçalho Referer
                else if (entry.referer) {
                    try {
                        const url = new URL(entry.referer);
                        let hostname = url.hostname.replace('www.', '').toLowerCase();
                        
                        // Normalização de redes sociais conhecidas via Referer (Web)
                        if (hostname.includes('facebook') || hostname === 'fb.com') source = 'Facebook';
                        else if (hostname.includes('instagram')) source = 'Instagram';
                        else if (hostname.includes('linkedin') || hostname === 'lnkd.in') source = 'LinkedIn';
                        else if (hostname.includes('twitter') || hostname.includes('t.co') || hostname === 'x.com') source = 'X (Twitter)';
                        else if (hostname.includes('pinterest')) source = 'Pinterest';
                        else if (hostname.includes('tiktok')) source = 'TikTok';
                        else if (hostname.includes('youtube') || hostname === 'youtu.be') source = 'YouTube';
                        else if (hostname.includes('google')) source = 'Google';
                        else if (hostname.includes('bing')) source = 'Bing';
                        else if (hostname.includes('github')) source = 'GitHub';
                        else source = hostname; // Outros sites

                    } catch (e) {
                        const refClean = entry.referer.trim();
                        if (refClean) source = refClean;
                    }
                }
            }
            
            stats.referrers[source] = (stats.referrers[source] || 0) + 1;

            // Bots vs Users
            if (entry.isBot) {
                stats.devices.bot++;
            } else {
                stats.devices.user++;
            }
        });

        // Ordenar Resultados
        const topContent = Object.entries(stats.bySlug)
            .sort(([, a], [, b]) => b.count - a.count)
            .map(([slug, val]) => ({ slug, ...val }));

        const timeline = Object.entries(stats.byDate)
            .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
            .map(([date, count]) => ({ date, count }));

        const referrers = Object.entries(stats.referrers)
            .sort(([, a], [, b]) => b - a)
            .map(([source, count]) => ({ source, count }));

        const summary = {
            total: stats.totalViews,
            articles: stats.byType['article'] || 0,
            tutorials: stats.byType['tutorial'] || 0,
            human: stats.devices.user,
            bot: stats.devices.bot
        };

        commit('setData', {
            summary,
            topContent,
            timeline,
            referrers
        });

      } catch (error: any) {
        console.error("Analytics Vuex Error:", error);
        commit('setError', error.message);
      } finally {
        commit('setLoading', false);
      }
    }
  }
};

export default analyticsModule;
