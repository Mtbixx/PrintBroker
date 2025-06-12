
import axios from 'axios';
import * as cheerio from 'cheerio';

interface IdeogramScrapedData {
  imageUrl: string;
  prompt: string;
  title?: string;
  aspectRatio?: string;
  model?: string;
  seed?: number;
  isPublic: boolean;
}

class IdeogramScraperService {
  private userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';

  async scrapeIdeogramLink(url: string): Promise<IdeogramScrapedData | null> {
    try {
      console.log('🔍 Ideogram linki analiz ediliyor:', url);

      // URL formatını kontrol et
      if (!url.includes('ideogram.ai/g/')) {
        throw new Error('Geçersiz Ideogram linki. Link ideogram.ai/g/ formatında olmalı.');
      }

      // Ideogram sayfasını çek
      const response = await axios.get(url, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
        timeout: 15000
      });

      const $ = cheerio.load(response.data);
      
      // Meta etiketlerinden bilgileri çek
      const ogImage = $('meta[property="og:image"]').attr('content');
      const ogTitle = $('meta[property="og:title"]').attr('content');
      const ogDescription = $('meta[property="og:description"]').attr('content');
      
      // JSON-LD verilerini ara
      let structuredData: any = null;
      $('script[type="application/ld+json"]').each((i, elem) => {
        try {
          const jsonText = $(elem).html();
          if (jsonText) {
            structuredData = JSON.parse(jsonText);
          }
        } catch (e) {
          // JSON parse hatası, devam et
        }
      });

      // Sayfa içeriğinden prompt bilgisini çek
      let extractedPrompt = '';
      
      // Farklı selektörler dene
      const promptSelectors = [
        '[data-testid="prompt"]',
        '.prompt',
        '[class*="prompt"]',
        '[class*="description"]',
        'p:contains("prompt")',
        'div:contains("prompt")'
      ];

      for (const selector of promptSelectors) {
        const promptElement = $(selector);
        if (promptElement.length > 0) {
          extractedPrompt = promptElement.text().trim();
          break;
        }
      }

      // Eğer prompt bulunamazsa, og:description'dan çek
      if (!extractedPrompt && ogDescription) {
        extractedPrompt = ogDescription;
      }

      // Görsel URL'sini çek
      let imageUrl = ogImage || '';
      
      // Eğer og:image yoksa, img etiketlerinden ara
      if (!imageUrl) {
        $('img').each((i, elem) => {
          const src = $(elem).attr('src');
          if (src && (src.includes('ideogram') || src.includes('cdn'))) {
            imageUrl = src;
            return false; // break
          }
        });
      }

      // URL'yi tam hale getir
      if (imageUrl && !imageUrl.startsWith('http')) {
        imageUrl = imageUrl.startsWith('//') ? 'https:' + imageUrl : 'https://ideogram.ai' + imageUrl;
      }

      const scrapedData: IdeogramScrapedData = {
        imageUrl: imageUrl,
        prompt: extractedPrompt || ogTitle || 'Prompt bulunamadı',
        title: ogTitle,
        aspectRatio: this.detectAspectRatio(imageUrl),
        isPublic: true
      };

      console.log('✅ Ideogram verisi başarıyla çekildi:', {
        imageUrl: scrapedData.imageUrl ? 'Bulundu' : 'Bulunamadı',
        prompt: scrapedData.prompt.substring(0, 50) + '...',
        title: scrapedData.title
      });

      return scrapedData;

    } catch (error) {
      console.error('❌ Ideogram link analizi hatası:', {
        url,
        error: error instanceof Error ? error.message : error
      });
      return null;
    }
  }

  private detectAspectRatio(imageUrl: string): string {
    // URL'den aspect ratio tahmin etmeye çalış
    if (imageUrl.includes('1024x1024')) return 'ASPECT_1_1';
    if (imageUrl.includes('1024x1792')) return 'ASPECT_9_16';
    if (imageUrl.includes('1792x1024')) return 'ASPECT_16_9';
    
    // Varsayılan
    return 'ASPECT_1_1';
  }

  // Ideogram ID'sini URL'den çıkar
  extractIdeogramId(url: string): string | null {
    const match = url.match(/ideogram\.ai\/g\/([^\/\?]+)/);
    return match ? match[1] : null;
  }

  // Alternatif API yaklaşımı (eğer varsa)
  async tryApiAccess(ideogramId: string): Promise<IdeogramScrapedData | null> {
    try {
      // Ideogram'ın public API'si varsa burada kullanılabilir
      // Şu an için sadece web scraping kullanıyoruz
      return null;
    } catch (error) {
      console.error('❌ Ideogram API erişimi başarısız:', error);
      return null;
    }
  }

  // Görsel kalitesini kontrol et
  async validateImageQuality(imageUrl: string): Promise<boolean> {
    try {
      const response = await axios.head(imageUrl, { timeout: 5000 });
      const contentLength = response.headers['content-length'];
      const contentType = response.headers['content-type'];

      // Temel kalite kontrolleri
      const isValidType = contentType?.includes('image/');
      const hasGoodSize = contentLength ? parseInt(contentLength) > 50000 : true; // 50KB üstü

      return isValidType && hasGoodSize;
    } catch (error) {
      console.warn('⚠️ Görsel kalite kontrolü yapılamadı:', error);
      return true; // Hata durumunda geçerli say
    }
  }
}

export const ideogramScraperService = new IdeogramScraperService();
export type { IdeogramScrapedData };
