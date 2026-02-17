import { Request, Response } from 'express';
import { db } from '../../../configs/firebase';

class AnalyticsController {
    
    /**
     * Helper para formatar a data
     */
    private formatDate(timestamp: number): string {
        return new Date(timestamp).toISOString().split('T')[0];
    }

    /**
     * Recupera analytics agregados para um portfólio
     */
    getAnalytics = async (req: Request, res: Response) => {
        try {
            const { portfolioId } = req.params;

            // Se o usuário não fornecer data, pega o mês atual
            const now = new Date();
            const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
            
            // Buscar dados brutos do Firebase (portfolios_analytics/{portfolioId}/{YearMonth})
            // Se quiser buscar múltiplos meses, precisaria iterar. Por simplicidade, vamos buscar o mês atual
            // ou permitir um parâmetro de mês específico no futuro.
            
            // Para simplificar, vou buscar apenas o mês atual ou o mês especificado no query param "period" (YYYY-MM)
            const period = (req.query.period as string) || currentYearMonth;
            
            console.log(`[Analytics] Fetching for ${portfolioId} period ${period}`);
            
            const analyticsRef = db.ref(`portfolios_analytics/${portfolioId}/${period}`);
            const snapshot = await analyticsRef.once('value');
            
            if (!snapshot.exists()) {
                return res.json({
                    totalViews: 0,
                    byType: { article: 0, tutorial: 0 },
                    bySlug: {},
                    byDate: [],
                    referrers: {},
                    browsers: {},
                    devices: {} // Simplificado
                });
            }

            const data = snapshot.val();
            const entries = Object.values(data) as any[];

            // Processar dados para o dashboard
            const stats = {
                totalViews: entries.length,
                byType: { article: 0, tutorial: 0 } as Record<string, number>,
                bySlug: {} as Record<string, { title: string, count: number, type: string }>,
                byDate: {} as Record<string, number>,
                referrers: {} as Record<string, number>,
                devices: { bot: 0, user: 0 }
            };

            entries.forEach(entry => {
                // Count by Type
                if (entry.type) {
                    stats.byType[entry.type] = (stats.byType[entry.type] || 0) + 1;
                }

                // Count by Slug
                if (entry.slug) {
                    if (!stats.bySlug[entry.slug]) {
                        stats.bySlug[entry.slug] = { 
                            title: entry.slug, // Poderíamos buscar o título real se quiséssemos
                            count: 0, 
                            type: entry.type 
                        };
                    }
                    stats.bySlug[entry.slug].count++;
                }

                // Count by Date
                const dateKey = this.formatDate(entry.timestamp);
                stats.byDate[dateKey] = (stats.byDate[dateKey] || 0) + 1;

                // Count Referrers
                if (entry.referer) {
                    try {
                        const url = new URL(entry.referer);
                        const domain = url.hostname;
                        stats.referrers[domain] = (stats.referrers[domain] || 0) + 1;
                    } catch (e) {
                        stats.referrers['Direct/Unknown'] = (stats.referrers['Direct/Unknown'] || 0) + 1;
                    }
                } else {
                    stats.referrers['Direct'] = (stats.referrers['Direct'] || 0) + 1;
                }

                // Bots vs Users
                if (entry.isBot) {
                    stats.devices.bot++;
                } else {
                    stats.devices.user++;
                }
            });

            // Ordenar por popularidade
            const topContent = Object.entries(stats.bySlug)
                .sort(([, a], [, b]) => b.count - a.count)
                .map(([slug, val]) => ({ slug, ...val }));

            // Ordenar por data
            const timeline = Object.entries(stats.byDate)
                .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
                .map(([date, count]) => ({ date, count }));

            return res.json({
                period,
                summary: {
                    total: stats.totalViews,
                    articles: stats.byType['article'] || 0,
                    tutorials: stats.byType['tutorial'] || 0,
                    human: stats.devices.user,
                    bot: stats.devices.bot
                },
                topContent,
                timeline,
                referrers: Object.entries(stats.referrers)
                    .sort(([, a], [, b]) => b - a)
                    .map(([source, count]) => ({ source, count }))
            });

        } catch (error) {
            console.error('[AnalyticsController] Error:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}

export const analyticsController = new AnalyticsController();
