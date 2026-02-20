import { defineStore } from 'pinia';
import { db } from '@/firebase/config';
import { ref, get, query, limitToLast } from 'firebase/database';
import { usePortfoliosStore } from './portfolios';

interface AnalyticsState {
  loading: boolean;
  error:   string | null;
  data: {
    summary:    { total: number; articles: number; tutorials: number; human: number; bot: number };
    topContent: any[];
    timeline:   any[];
    referrers:  any[];
  } | null;
}

export const useAnalyticsStore = defineStore('analytics', {
  state: (): AnalyticsState => ({
    loading: false,
    error:   null,
    data:    null,
  }),
  actions: {
    async fetchAnalytics() {
      const portfolios  = usePortfoliosStore();
      const portfolioId = portfolios.activePortfolioId;
      if (!portfolioId) { this.error = 'Nenhum portfólio ativo.'; return; }

      this.loading = true;
      this.error   = null;
      try {
        const snap = await get(query(ref(db, `portfolios_analytics/${portfolioId}`), limitToLast(12)));

        if (!snap.exists()) {
          this.data = { summary: { total: 0, articles: 0, tutorials: 0, human: 0, bot: 0 }, topContent: [], timeline: [], referrers: [] };
          return;
        }

        const raw = snap.val();
        let entries: any[] = [];
        Object.values(raw).forEach((month: any) => { if (month) entries = entries.concat(Object.values(month)); });

        const byType:     Record<string, number> = {};
        const bySlug:     Record<string, { title: string; count: number; type: string }> = {};
        const byDate:     Record<string, number> = {};
        const referrers:  Record<string, number> = {};
        const devices = { bot: 0, user: 0 };

        entries.forEach((e) => {
          if (e.type) byType[e.type] = (byType[e.type] || 0) + 1;

          if (e.slug) {
            if (!bySlug[e.slug]) bySlug[e.slug] = { title: e.slug, count: 0, type: e.type };
            bySlug[e.slug].count++;
          }

          const dateKey = e.timestamp ? new Date(e.timestamp).toISOString().split('T')[0]
                        : e.isoDate   ? e.isoDate.split('T')[0]
                        : 'Unknown';
          byDate[dateKey] = (byDate[dateKey] || 0) + 1;

          let source = 'Direct';
          if (e.utm?.source) {
            source = e.utm.source.charAt(0).toUpperCase() + e.utm.source.slice(1);
          } else if (e.userAgent) {
            const ua = e.userAgent.toLowerCase();
            if      (ua.includes('whatsapp'))                           source = 'WhatsApp';
            else if (ua.includes('instagram'))                          source = 'Instagram';
            else if (ua.includes('telegram'))                           source = 'Telegram';
            else if (ua.includes('linkedin') || ua.includes('linkedinbot')) source = 'LinkedIn';
            else if (ua.includes('fban') || ua.includes('fbav') || ua.includes('facebook')) source = 'Facebook';
            else if (ua.includes('twitter') || ua.includes('twitterbot')) source = 'X (Twitter)';
            else if (ua.includes('tiktok'))                             source = 'TikTok';
          } else if (e.referer) {
            try {
              const h = new URL(e.referer).hostname.replace('www.', '').toLowerCase();
              if      (h.includes('google'))                    source = 'Google';
              else if (h.includes('bing'))                      source = 'Bing';
              else if (h.includes('github'))                    source = 'GitHub';
              else if (h.includes('linkedin'))                  source = 'LinkedIn';
              else if (h.includes('facebook'))                  source = 'Facebook';
              else if (h.includes('twitter') || h === 'x.com') source = 'X (Twitter)';
              else source = h;
            } catch { if (e.referer.trim()) source = e.referer.trim(); }
          }
          referrers[source] = (referrers[source] || 0) + 1;
          if (e.isBot) devices.bot++; else devices.user++;
        });

        this.data = {
          summary:    { total: entries.length, articles: byType['article'] || 0, tutorials: byType['tutorial'] || 0, human: devices.user, bot: devices.bot },
          topContent: Object.entries(bySlug).sort(([, a], [, b]) => b.count - a.count).map(([slug, v]) => ({ slug, ...v })),
          timeline:   Object.entries(byDate).sort(([a], [b]) => a.localeCompare(b)).map(([date, count]) => ({ date, count })),
          referrers:  Object.entries(referrers).sort(([, a], [, b]) => b - a).map(([source, count]) => ({ source, count })),
        };
      } catch (error: any) {
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },
  },
});
