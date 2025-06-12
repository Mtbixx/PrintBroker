
import { Request, Response } from 'express';

// SEO dostu statik HTML template
const renderSEOPage = (url: string, title: string, description: string, keywords: string) => {
  return `
<!DOCTYPE html>
<html lang="tr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    
    <!-- SEO Meta Tags -->
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <meta name="keywords" content="${keywords}" />
    <meta name="author" content="MatBixx" />
    <meta name="robots" content="index, follow, max-image-preview:large" />
    <link rel="canonical" href="https://matbixx.com${url}" />
    
    <!-- Open Graph Meta Tags -->
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://matbixx.com${url}" />
    <meta property="og:image" content="https://matbixx.com/og-image.jpg" />
    <meta property="og:site_name" content="MatBixx" />
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    
    <!-- Structured Data -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "MatBixx",
      "url": "https://matbixx.com",
      "logo": "https://matbixx.com/logo.png",
      "description": "Türkiye'nin önde gelen B2B baskı platformu"
    }
    </script>
  </head>
  <body>
    <div id="root">
      <div style="padding: 20px; text-align: center;">
        <h1>${title}</h1>
        <p>${description}</p>
        <div>Loading...</div>
      </div>
    </div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
  `;
};

// SEO rotaları
export const seoRoutes = {
  '/': {
    title: 'MatBixx - Türkiye\'nin Önde Gelen B2B Baskı Platformu',
    description: '500+ sertifikalı matbaacıdan anında teklif alın. ISO 9001 kalite garantisi ile profesyonel baskı çözümleri.',
    keywords: 'baskı, matbaa, B2B baskı platformu, profesyonel baskı'
  },
  '/blog': {
    title: 'Baskı Sektörü Blog - MatBixx',
    description: 'Profesyonel baskı hizmetleri, teknoloji trendleri ve sektör analizleri ile güncel kalın.',
    keywords: 'baskı blog, baskı teknolojileri, matbaa haberleri'
  },
  '/urunler': {
    title: 'Profesyonel Baskı Çözümleri - MatBixx',
    description: 'Her sektöre özel, ISO 9001 kalite standardında baskı hizmetleri.',
    keywords: 'kartvizit baskı, etiket baskı, broşür baskı, profesyonel baskı'
  },
  '/referanslar': {
    title: 'Başarı Hikayeleri ve Referanslar - MatBixx',
    description: '500+ mutlu müşteri ve Fortune 500 şirketlerinin güvendiği baskı platformu.',
    keywords: 'matbixx referansları, müşteri hikayeleri, baskı projeleri'
  }
};

export const handleSEORoute = (req: Request, res: Response, next: Function) => {
  const userAgent = req.get('User-Agent') || '';
  const isBot = /googlebot|bingbot|slurp|duckduckbot|baiduspider|yandexbot|sogou|facebook|twitter/i.test(userAgent);
  
  if (isBot) {
    const route = seoRoutes[req.path as keyof typeof seoRoutes];
    if (route) {
      const html = renderSEOPage(req.path, route.title, route.description, route.keywords);
      return res.send(html);
    }
  }
  
  next();
};
