import { Request, Response } from 'express';
import { db } from '../../../configs/firebase';
import fetch from 'node-fetch';

const MAIN_APP_URL = "https://moises-work-app.web.app"; 

class LinkController {
    
    /**
     * Handler para compartilhamento de projetos
     */
    getProjectShare = async (req: Request, res: Response): Promise<Response | void> => {
        try {
            const { slug, portfolioId } = req.params;

            if (!slug || !portfolioId) {
                return res.status(400).send('Missing slug or portfolioId.');
            }

            const resolvedPortfolioId = await this.resolvePortfolioId(portfolioId);

            const projectRef = db.ref(`portfolios_content/${resolvedPortfolioId}/projects`);
            const snapshot = await projectRef.once('value');
            const projects = snapshot.val();

            let project = null;
            if (Array.isArray(projects)) {
                project = projects.find((p: any) => p.id === slug || p.slug === slug); // Projetos podem usar ID como slug
            } else if (projects) {
                project = Object.values(projects).find((p: any) => p.id === slug || p.slug === slug);
            }

            if (!project) {
                return res.status(404).send('Project not found.');
            }

            // Analytics: Log access asynchronously
            this.logAccess(resolvedPortfolioId, 'project', slug, req).catch(err => 
                console.error('[LinkController] Failed to log project access', err)
            );

            const metaRef = db.ref(`portfolios_meta/${resolvedPortfolioId}`);
            const metaSnap = await metaRef.once('value');
            const meta = metaSnap.val();
            const portfolioSlug = meta?.slug || resolvedPortfolioId;

            const targetUrl = `${MAIN_APP_URL}/${portfolioSlug}/projeto/${slug}`;
            const isShareLink = req.path.includes('/share/');

            if (isShareLink) {
                const html = this.generateMetaHtml(
                    project.title,
                    project.description || 'Confira este projeto incrível!',
                    project.image || 'https://placehold.co/1200x630?text=Project',
                    targetUrl,
                    'website'
                );
                res.setHeader('Content-Type', 'text/html; charset=utf-8');
                res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=600');
                return res.send(html);
            } else {
                 return await this.serveIndexWithMeta(res, {
                    title: project.title,
                    description: project.description || 'Confira este projeto incrível!',
                    image: project.image || 'https://placehold.co/1200x630?text=Project',
                    url: targetUrl,
                    type: 'website'
                });
            }

        } catch (error) {
            console.error('Error in getProjectShare:', error);
            return res.status(500).send('Internal Server Error');
        }
    }

    /**
     * Endpoint de DEBUG para validar meta tags de projeto
     */
    debugProject = async (req: Request, res: Response): Promise<Response> => {
        try {
            const { portfolioId, slug } = req.params;
            
            if (!slug || !portfolioId) {
                return res.status(400).json({ error: 'Missing slug or portfolioId' });
            }

            const resolvedId = await this.resolvePortfolioId(portfolioId);
            const projectRef = db.ref(`portfolios_content/${resolvedId}/projects`);
            const snapshot = await projectRef.once('value');
            const projects = snapshot.val();
            
            let project = null;
            if (Array.isArray(projects)) {
                project = projects.find((p: any) => p.id === slug || p.slug === slug);
            } else if (projects) {
                project = Object.values(projects || {}).find((p: any) => p.id === slug || p.slug === slug);
            }
            
            if (!project) {
                return res.status(404).json({ error: 'Project not found' });
            }

            const metaRef = db.ref(`portfolios_meta/${resolvedId}`);
            const metaSnap = await metaRef.once('value');
            const meta = metaSnap.val();
            const portfolioSlug = meta?.slug || resolvedId;
            
            const shareUrl = `${MAIN_APP_URL}/share/${portfolioId}/project/${slug}`;
            
            return res.json({
                success: true,
                project: {
                    title: project.title,
                    description: project.description,
                    image: project.image,
                    id: project.id,
                    slug: slug, // Usando o slug da rota
                    technologies: project.technologies || []
                },
                urls: {
                    share: shareUrl,
                    direct: `${MAIN_APP_URL}/${portfolioSlug}/projeto/${slug}`,
                    canonical: `${MAIN_APP_URL}/${portfolioSlug}/projeto/${slug}`
                },
                metaTags: {
                    'og:type': 'website',
                    'og:title': project.title,
                    'og:description': project.description || '',
                    'og:image': project.image,
                    'og:url': `${MAIN_APP_URL}/${portfolioSlug}/projeto/${slug}`,
                    'og:site_name': 'Moisés Felix - Portfólio',
                    'og:locale': 'pt_BR'
                },
                validation: {
                    hasImage: !!project.image,
                    imageHttps: project.image?.startsWith('https://') || false,
                    titleLength: project.title?.length || 0,
                    descriptionLength: (project.description || '').length
                }
            });

        } catch (error: any) {
            console.error('Error in debugProject:', error);
            return res.status(500).json({ 
                error: 'Internal Server Error', 
                details: error.message 
            });
        }
    }

    /**
     * Helper to resolve portfolio ID from Slug if needed
     */
    async resolvePortfolioId(idOrSlug: string): Promise<string> {
        // First check if it's a known slug
        const slugRef = db.ref(`slugs/${idOrSlug}`);
        const slugSnap = await slugRef.once('value');
        if (slugSnap.exists()) {
            return slugSnap.val();
        }
        // If not, assume it is already an ID
        return idOrSlug;
    }

    /**
     * Helper para escapar HTML e prevenir XSS
     */
    private escapeHtml(text: string): string {
        const map: { [key: string]: string } = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, (m) => map[m]);
    }

    /**
     * Analytics Logger
     */
    private async logAccess(
        portfolioId: string,
        type: 'article' | 'tutorial' | 'project',
        slug: string,
        req: Request
    ) {
        try {
            const userAgent = req.headers['user-agent'] || '';
            // Basic bot detection
            const isBot = /bot|googlebot|crawler|spider|robot|crawling|facebookexternalhit|linkedinbot|twitterbot/i.test(userAgent);
            
            const referer = req.headers['referer'] || '';
            // Handle X-Forwarded-For which can be an array or string
            const forwarded = req.headers['x-forwarded-for'];
            const ip = (typeof forwarded === 'string' ? forwarded.split(',')[0] : (Array.isArray(forwarded) ? forwarded[0] : req.socket.remoteAddress)) || '';
            
            const { utm_source, utm_medium, utm_campaign, utm_term, utm_content } = req.query;

            const entry = {
                timestamp: Date.now(),
                isoDate: new Date().toISOString(),
                type,
                slug,
                referer,
                userAgent,
                ip, 
                isBot,
                utm: {
                    source: utm_source || null,
                    medium: utm_medium || null,
                    campaign: utm_campaign || null,
                    term: utm_term || null,
                    content: utm_content || null
                }
            };
            
            // Clean up empty UTM
            Object.keys(entry.utm).forEach((k) => {
                if ((entry.utm as any)[k] == null) delete (entry.utm as any)[k];
            });
            if (Object.keys(entry.utm).length === 0) {
                delete (entry as any).utm;
            }

            // Path: portfolios_analytics/{portfolioId}/{YYYY-MM}/{timestamp_random}
            const date = new Date();
            const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            
            await db.ref(`portfolios_analytics/${portfolioId}/${yearMonth}`).push(entry);
            console.log(`[Analytics] Logged access for ${type}/${slug}`);

        } catch (e) {
            console.error('[LinkController] Analytics error:', e);
        }
    }

    /**
     * Handler para compartilhamento de artigos
     * Suporta tanto /share/:portfolioId/article/:slug quanto /:portfolioId/artigo/:slug
     */
    getArticleShare = async (req: Request, res: Response): Promise<Response | void> => {
        try {
            const { slug, portfolioId } = req.params; 
            console.log(`[LinkController] getArticleShare called for slug: ${slug}, portfolioId: ${portfolioId}`);

            if (!slug || !portfolioId) {
                console.warn('[LinkController] Missing slug or portfolioId');
                return res.status(400).send('Missing slug or portfolioId.');
            }

            const resolvedPortfolioId = await this.resolvePortfolioId(portfolioId);
            console.log(`[LinkController] Resolved ID: ${resolvedPortfolioId}`);

            console.log(`[LinkController] Fetching article from portfolios_content/${resolvedPortfolioId}/articles`);
            const articleRef = db.ref(`portfolios_content/${resolvedPortfolioId}/articles`);
            const snapshot = await articleRef.once('value');
            const articles = snapshot.val();

            if (!articles) {
                 console.warn('[LinkController] No articles found for this portfolio.');
                 return res.status(404).send('Articles not found.');
            }

            let article = null;
            if (Array.isArray(articles)) {
                article = articles.find((a: any) => a.slug === slug);
            } else if (articles) {
                article = Object.values(articles).find((a: any) => a.slug === slug);
            }

            if (!article) {
                console.warn(`[LinkController] Article with slug "${slug}" not found.`);
                return res.status(404).send('Article not found.');
            }
            
            console.log(`[LinkController] Article found: ${article.title}`);

            // Analytics: Log access asynchronously
            this.logAccess(resolvedPortfolioId, 'article', slug, req).catch(err => 
                console.error('[LinkController] Failed to log article access', err)
            );

            // Fetch Meta Info to construct correct URL
            const metaRef = db.ref(`portfolios_meta/${resolvedPortfolioId}`);
            const metaSnap = await metaRef.once('value');
            const meta = metaSnap.val();
            const portfolioSlug = meta?.slug || resolvedPortfolioId;

            // Define URL baseada no slug do portfolio, não no ID
            const targetUrl = `${MAIN_APP_URL}/${portfolioSlug}/artigo/${slug}`;
            
            // Check path to distinguish Direct Rewrite vs Share API
            // Direct Rewrite: /portfolio-slug/artigo/article-slug
            // Share API: /share/portfolio-id/article/article-slug
            const isShareLink = req.path.includes('/share/');

            if (isShareLink) {
                 const html = this.generateMetaHtml(
                    article.title,
                    article.description || article.excerpt || 'Read this article',
                    article.image || 'https://placehold.co/1200x630?text=Article', 
                    targetUrl,
                    'article'
                );
                res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=600');
                res.setHeader('Content-Type', 'text/html; charset=utf-8');
                return res.send(html);
            } else {
                // Direct access via rewrite: Inject meta into index.html
                return await this.serveIndexWithMeta(res, {
                    title: article.title,
                    description: article.description || article.excerpt || 'Read this article',
                    image: article.image || 'https://placehold.co/1200x630?text=Article',
                    url: targetUrl,
                    type: 'article'
                });
            }

        } catch (error) {
            console.error('[LinkController] Error in getArticleShare:', error);
            return res.status(500).send('Internal Server Error');
        }
    }

    /**
     * Handler para compartilhamento de tutoriais
     * Suporta tanto /share/:portfolioId/tutorial/:slug quanto /:portfolioId/tutorial/:slug
     */
    getTutorialShare = async (req: Request, res: Response): Promise<Response | void> => {
        try {
            const { slug, portfolioId } = req.params;

            if (!slug || !portfolioId) {
                return res.status(400).send('Missing slug or portfolioId.');
            }

            const resolvedPortfolioId = await this.resolvePortfolioId(portfolioId);

            const tutorialRef = db.ref(`portfolios_content/${resolvedPortfolioId}/tutorials`);
            const snapshot = await tutorialRef.once('value');
            const tutorials = snapshot.val();

            let tutorial = null;
            if (Array.isArray(tutorials)) {
                tutorial = tutorials.find((t: any) => t.slug === slug);
            } else if (tutorials) {
                tutorial = Object.values(tutorials).find((t: any) => t.slug === slug);
            }

            if (!tutorial) {
                return res.status(404).send('Tutorial not found.');
            }

            // Analytics: Log access asynchronously
            this.logAccess(resolvedPortfolioId, 'tutorial', slug, req).catch(err => 
                console.error('[LinkController] Failed to log tutorial access', err)
            );

            const metaRef = db.ref(`portfolios_meta/${resolvedPortfolioId}`);
            const metaSnap = await metaRef.once('value');
            const meta = metaSnap.val();
            const portfolioSlug = meta?.slug || resolvedPortfolioId;

            const targetUrl = `${MAIN_APP_URL}/${portfolioSlug}/tutorial/${slug}`;
            const isShareLink = req.path.includes('/share/');

            if (isShareLink) {
                const html = this.generateMetaHtml(
                    tutorial.title,
                    tutorial.description || tutorial.excerpt || 'Check out this tutorial',
                    tutorial.image || 'https://placehold.co/1200x630?text=Tutorial',
                    targetUrl,
                    'article'
                );
                res.setHeader('Content-Type', 'text/html; charset=utf-8');
                res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=600');
                return res.send(html);
            } else {
                 return await this.serveIndexWithMeta(res, {
                    title: tutorial.title,
                    description: tutorial.description || tutorial.excerpt || 'Check out this tutorial',
                    image: tutorial.image || 'https://placehold.co/1200x630?text=Tutorial',
                    url: targetUrl,
                    type: 'article'
                });
            }

        } catch (error) {
            console.error('Error in getTutorialShare:', error);
            return res.status(500).send('Internal Server Error');
        }
    }

    /**
     * Endpoint de DEBUG para validar meta tags antes de compartilhar
     * URL: /debug/article/:portfolioId/:slug
     */
    debugArticle = async (req: Request, res: Response): Promise<Response> => {
        try {
            const { portfolioId, slug } = req.params;
            
            if (!slug || !portfolioId) {
                return res.status(400).json({ error: 'Missing slug or portfolioId' });
            }

            const resolvedId = await this.resolvePortfolioId(portfolioId);
            const articleRef = db.ref(`portfolios_content/${resolvedId}/articles`);
            const snapshot = await articleRef.once('value');
            const articles = snapshot.val();
            
            let article = null;
            if (Array.isArray(articles)) {
                article = articles.find((a: any) => a.slug === slug);
            } else if (articles) {
                article = Object.values(articles || {}).find((a: any) => a.slug === slug);
            }
            
            if (!article) {
                return res.status(404).json({ error: 'Article not found' });
            }

            const metaRef = db.ref(`portfolios_meta/${resolvedId}`);
            const metaSnap = await metaRef.once('value');
            const meta = metaSnap.val();
            const portfolioSlug = meta?.slug || resolvedId;
            
            const shareUrl = `${MAIN_APP_URL}/share/${portfolioId}/article/${slug}`;
            
            // Retornar informações completas de debug
            return res.json({
                success: true,
                article: {
                    title: article.title,
                    description: article.excerpt || article.description,
                    image: article.image,
                    slug: article.slug,
                    category: article.category,
                    tags: article.tags || []
                },
                urls: {
                    share: shareUrl,
                    direct: `${MAIN_APP_URL}/${portfolioSlug}/artigo/${slug}`,
                    canonical: `${MAIN_APP_URL}/${portfolioSlug}/artigo/${slug}`
                },
                metaTags: {
                    'og:type': 'article',
                    'og:title': article.title,
                    'og:description': article.excerpt || article.description || '',
                    'og:image': article.image,
                    'og:image:width': '1200',
                    'og:image:height': '630',
                    'og:image:secure_url': article.image,
                    'og:url': `${MAIN_APP_URL}/${portfolioSlug}/artigo/${slug}`,
                    'og:site_name': 'Moisés Felix - Portfólio',
                    'og:locale': 'pt_BR'
                },
                validation: {
                    hasImage: !!article.image,
                    imageHttps: article.image?.startsWith('https://') || false,
                    titleLength: article.title?.length || 0,
                    titleValid: (article.title?.length || 0) <= 60,
                    descriptionLength: (article.excerpt || article.description || '').length,
                    descriptionValid: (article.excerpt || article.description || '').length <= 200,
                    recommendations: [
                        article.title?.length > 60 ? '⚠️ Título muito longo (max 60 chars para LinkedIn)' : '✅ Título OK',
                        (article.excerpt || article.description || '').length > 200 ? '⚠️ Descrição muito longa (max 200 chars para LinkedIn)' : '✅ Descrição OK',
                        !article.image ? '❌ Imagem faltando' : '✅ Imagem presente',
                        !article.image?.startsWith('https://') ? '⚠️ Imagem deve ser HTTPS' : '✅ Imagem HTTPS',
                        '💡 LinkedIn exige imagens >= 1200x627px'
                    ]
                },
                tools: {
                    linkedInInspector: `https://www.linkedin.com/post-inspector/inspect?url=${encodeURIComponent(shareUrl)}`,
                    facebookDebugger: `https://developers.facebook.com/tools/debug/?q=${encodeURIComponent(shareUrl)}`,
                    twitterValidator: `https://cards-dev.twitter.com/validator`
                }
            });

        } catch (error: any) {
            console.error('Error in debugArticle:', error);
            return res.status(500).json({ 
                error: 'Internal Server Error', 
                details: error.message 
            });
        }
    }

    /**
     * Gera HTML com meta tags otimizadas para LinkedIn, Facebook e Twitter
     * CRITICAL: LinkedIn exige:
     * - og:image >= 1200x627px
     * - og:title <= 60 chars
     * - og:description <= 200 chars
     * - og:image:width e og:image:height
     * - HTTPS para imagem
     */
    generateMetaHtml(
        title: string,
        description: string,
        imageUrl: string,
        url: string,
        type: 'article' | 'website' = 'article'
    ) {
        // LinkedIn exige imagens >= 1200x627px
        const linkedInOptimizedImage = imageUrl.includes('placehold.co') 
            ? 'https://placehold.co/1200x630/667eea/ffffff?text=' + encodeURIComponent(title.substring(0, 30))
            : imageUrl;
        
        // Garantir que descrição não ultrapasse 200 caracteres (limite LinkedIn)
        const truncatedDescription = description.length > 200 
            ? description.substring(0, 197) + '...' 
            : description;

        // Garantir que título não ultrapasse 60 caracteres (recomendação LinkedIn)
        const truncatedTitle = title.length > 60 
            ? title.substring(0, 57) + '...' 
            : title;

        return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- Primary Meta Tags -->
    <title>${this.escapeHtml(truncatedTitle)}</title>
    <meta name="title" content="${this.escapeHtml(truncatedTitle)}">
    <meta name="description" content="${this.escapeHtml(truncatedDescription)}">
    
    <!-- Open Graph / Facebook / LinkedIn -->
    <meta property="og:type" content="${type}">
    <meta property="og:url" content="${url}">
    <meta property="og:title" content="${this.escapeHtml(truncatedTitle)}">
    <meta property="og:description" content="${this.escapeHtml(truncatedDescription)}">
    <meta property="og:image" content="${linkedInOptimizedImage}">
    <meta property="og:image:secure_url" content="${linkedInOptimizedImage}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="${this.escapeHtml(truncatedTitle)}">
    <meta property="og:site_name" content="Moisés Felix - Portfólio">
    <meta property="og:locale" content="pt_BR">
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="${url}">
    <meta name="twitter:title" content="${this.escapeHtml(truncatedTitle)}">
    <meta name="twitter:description" content="${this.escapeHtml(truncatedDescription)}">
    <meta name="twitter:image" content="${linkedInOptimizedImage}">
    
    <!-- LinkedIn Specific (Article metadata) -->
    <meta property="article:author" content="Moisés Felix">
    <meta property="article:published_time" content="${new Date().toISOString()}">
    <meta property="article:section" content="Tecnologia">
    
    <!-- Canonical URL -->
    <link rel="canonical" href="${url}">
    
    <!-- Preconnect for performance -->
    <link rel="preconnect" href="https://moises-work-app.web.app">
    
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
        }
        
        .loader {
            text-align: center;
            max-width: 400px;
        }
        
        .spinner {
            border: 4px solid rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            border-top: 4px solid white;
            width: 50px;
            height: 50px;
            animation: spin 1s linear infinite;
            margin: 0 auto 30px;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        h1 {
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 15px;
            line-height: 1.4;
        }
        
        p {
            font-size: 16px;
            opacity: 0.9;
            line-height: 1.6;
        }
        
        .logo {
            width: 60px;
            height: 60px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 20px;
            font-size: 28px;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="loader">
        <div class="logo">MF</div>
        <div class="spinner"></div>
        <h1>${this.escapeHtml(truncatedTitle)}</h1>
        <p>Redirecionando você para o artigo...</p>
    </div>
    
    <script>
        // Detectar se é um bot (crawlers não executam JS, mas é bom ter)
        const isBot = /bot|crawler|spider|crawling|facebookexternalhit|linkedinbot|twitterbot/i.test(navigator.userAgent);
        
        // Bots não precisam de delay (eles não vêem JS de qualquer forma)
        const delay = isBot ? 0 : 200;
        
        setTimeout(function() {
            window.location.href = "${url}";
        }, delay);
    </script>
    
    <!-- Fallback para navegadores sem JavaScript e crawlers -->
    <noscript>
        <meta http-equiv="refresh" content="0;url=${url}">
        <p>Se você não for redirecionado automaticamente, <a href="${url}" style="color: white; text-decoration: underline;">clique aqui</a>.</p>
    </noscript>
</body>
</html>`;
    }

    /**
     * Serve o index.html principal com meta tags injetadas dinamicamente
     * Usado para acesso direto via rewrite (ex: /portfolio-slug/artigo/article-slug)
     */
    async serveIndexWithMeta(res: Response, meta: any): Promise<void> {
        try {
            // Fetch index.html from hosting
            const indexResponse = await fetch(`${MAIN_APP_URL}/index.html`);
            if (!indexResponse.ok) {
                 throw new Error("Could not fetch index.html");
            }
            
            let html = await indexResponse.text();

            const safeTitle = this.escapeHtml(meta.title || '');
            const safeDesc = this.escapeHtml(meta.description || '');
            const safeImage = meta.image || 'https://placehold.co/1200x630?text=Article';
            
            // Função auxiliar para substituir ou inserir meta tags
            const replaceMeta = (htmlContent: string, property: string, content: string) => {
                 const regex = new RegExp(`<meta (property|name)="${property}" content="[^"]*">`, 'g');
                 if (regex.test(htmlContent)) {
                     return htmlContent.replace(regex, `<meta $1="${property}" content="${content}">`);
                 }
                 // Se não encontrou, insere antes de </head>
                 return htmlContent.replace('</head>', `    <meta property="${property}" content="${content}">\n</head>`);
            };
            
            // Substituir title
            html = html.replace(/<title>.*?<\/title>/, `<title>${safeTitle}</title>`);
            
            // Substituir/Adicionar meta tags OpenGraph e Twitter
            html = replaceMeta(html, 'og:title', safeTitle);
            html = replaceMeta(html, 'og:description', safeDesc);
            html = replaceMeta(html, 'og:image', safeImage);
            html = replaceMeta(html, 'og:image:width', '1200');
            html = replaceMeta(html, 'og:image:height', '630');
            html = replaceMeta(html, 'og:image:secure_url', safeImage);
            html = replaceMeta(html, 'og:url', meta.url);
            html = replaceMeta(html, 'og:type', meta.type || 'article');
            html = replaceMeta(html, 'og:locale', 'pt_BR');
            html = replaceMeta(html, 'twitter:title', safeTitle);
            html = replaceMeta(html, 'twitter:description', safeDesc);
            html = replaceMeta(html, 'twitter:image', safeImage);
            html = replaceMeta(html, 'twitter:card', 'summary_large_image');
            html = replaceMeta(html, 'description', safeDesc);

            res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=600');
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.send(html);
        } catch (e) {
            console.error("Failed to serve index with meta:", e);
            res.status(500).send("Error loading page");
        }
    }
}

export const linkController = new LinkController();