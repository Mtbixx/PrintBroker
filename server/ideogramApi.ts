import axios from 'axios';
import FormData from 'form-data';

interface IdeogramRequest {
  image_request: {
    prompt: string;
    aspect_ratio?: string;
    model?: string;
    magic_prompt_option?: string;
    seed?: number;
    style_type?: string;
    negative_prompt?: string;
  };
}

interface IdeogramResponse {
  created: string;
  data: Array<{
    url: string;
    is_image_safe: boolean;
    prompt: string;
    resolution: string;
    seed: number;
  }>;
}

class IdeogramService {
  private apiKey: string;
  private baseUrl = 'https://api.ideogram.ai/generate';

  constructor() {
    this.apiKey = 'X3h2wLDuOfuJynGGclLZhLN1isGvy9oxBM-S8wcNJVTqk80lyW6pszMShoMHP8YbN7DYSfzti7eTLL-KCExqZw';
    if (!this.apiKey) {
      console.warn('IDEOGRAM_API_KEY environment variable not set - design generation will be disabled');
    }
  }

  async generateImage(prompt: string, options: {
    aspectRatio?: 'ASPECT_1_1' | 'ASPECT_10_16' | 'ASPECT_16_10' | 'ASPECT_9_16' | 'ASPECT_16_9' | 'ASPECT_3_2' | 'ASPECT_2_3';
    model?: 'V_1' | 'V_1_TURBO' | 'V_2' | 'V_2_TURBO';
    styleType?: 'AUTO' | 'GENERAL' | 'REALISTIC' | 'DESIGN' | 'RENDER_3D' | 'ANIME';
    magicPrompt?: 'AUTO' | 'ON' | 'OFF';
    negativePrompt?: string;
    seed?: number;
  } = {}): Promise<IdeogramResponse> {
    if (!this.apiKey) {
      throw new Error('Ideogram API key not configured. Please contact administrator.');
    }
    try {
      // Etiket tasarımları için özel prompt optimizasyonu
      const enhancedPrompt = this.enhancePromptForLabels(prompt);
      const enhancedOptions = this.optimizeOptionsForLabels(prompt, options);

      console.log('🎯 API İsteği Gönderiliyor:', {
        originalPrompt: prompt,
        enhancedPrompt,
        options: enhancedOptions
      });

      const requestData: IdeogramRequest = {
        image_request: {
          prompt: enhancedPrompt,
          aspect_ratio: enhancedOptions.aspectRatio || 'ASPECT_1_1',
          model: enhancedOptions.model || 'V_2',
          style_type: enhancedOptions.styleType || 'DESIGN',
          magic_prompt_option: enhancedOptions.magicPrompt || 'AUTO',
          negative_prompt: enhancedOptions.negativePrompt,
          seed: enhancedOptions.seed,
        }
      };

      const response = await axios.post<IdeogramResponse>(
        this.baseUrl,
        requestData,
        {
          headers: {
            'Api-Key': this.apiKey,
            'Content-Type': 'application/json',
          },
          timeout: 60000, // 60 seconds timeout
        }
      );

      console.log('📊 API Yanıtı:', {
        status: response.status,
        dataCount: response.data.data?.length || 0,
        created: response.data.created
      });

      // Gelişmiş hata kontrolü
      this.validateApiResponse(response.data);

      // Kalite kontrolü uygula
      const validatedResult = this.validateDesignResult(response.data, prompt);
      return validatedResult;
    } catch (error) {
      console.error('❌ Ideogram API Hatası:', {
        error: error instanceof Error ? error.message : error,
        prompt,
        options,
        axiosError: axios.isAxiosError(error) ? {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        } : null
      });
      
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(`Ideogram API Error (${error.response.status}): ${error.response.statusText}`);
      }
      
      throw new Error('Failed to generate image with Ideogram API');
    }
  }

  async generateMultipleImages(prompts: string[], options: Parameters<typeof this.generateImage>[1] = {}): Promise<IdeogramResponse[]> {
    const promises = prompts.map(prompt => this.generateImage(prompt, options));
    return Promise.all(promises);
  }

  // Batch generation with rate limiting
  async generateBatch(requests: Array<{ prompt: string; options?: Parameters<typeof this.generateImage>[1] }>, batchSize = 3): Promise<IdeogramResponse[]> {
    if (!this.apiKey) {
      throw new Error('Ideogram API key not configured. Please contact administrator.');
    }

    const results: IdeogramResponse[] = [];

    for (let i = 0; i < requests.length; i += batchSize) {
      const batch = requests.slice(i, i + batchSize);
      const batchPromises = batch.map(req => this.generateImage(req.prompt, req.options));
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // Rate limiting delay between batches
      if (i + batchSize < requests.length) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    return results;
  }

  // Etiket tasarımları için prompt geliştirme
  private enhancePromptForLabels(originalPrompt: string): string {
    const isLabelDesign = this.isLabelDesign(originalPrompt);
    
    if (isLabelDesign) {
      // Geliştirilmiş etiket tasarımı promptu
      const qualityKeywords = [
        'ultra high quality', 'professional design', 'crisp details', 
        'sharp typography', 'commercial grade', 'print-ready',
        'clean vector style', 'premium aesthetics', 'brand identity'
      ].join(', ');

      const technicalSpecs = [
        'high resolution', 'vector graphics', 'CMYK color profile',
        'scalable design', 'commercial printing standards',
        'typography hierarchy', 'visual balance'
      ].join(', ');

      const labelPrompt = `${qualityKeywords}. Professional product label design: ${originalPrompt}. Technical requirements: ${technicalSpecs}. Design specifications: clean modern layout, readable typography, balanced composition, professional color scheme, brand-focused elements. STRICT EXCLUSIONS: no mockup, no bottle, no package, no 3D rendering, no realistic product shots, no shadows, no perspective. OUTPUT: flat 2D label design only, commercial quality, print-optimized.`;
      
      console.log('🏷️ GELİŞTİRİLMİŞ ETIKET PROMPT:', {
        originalLength: originalPrompt.length,
        enhancedLength: labelPrompt.length,
        prompt: labelPrompt
      });
      
      return labelPrompt;
    }
    
    // Normal tasarımlar için de kalite artırımı
    const enhancedPrompt = `High quality, professional design: ${originalPrompt}. Clean composition, sharp details, modern aesthetic, commercial grade quality.`;
    
    console.log('📝 Geliştirilmiş normal prompt:', enhancedPrompt);
    return enhancedPrompt;
  }

  // Etiket tasarımları için seçenek optimizasyonu
  private optimizeOptionsForLabels(originalPrompt: string, options: any): any {
    const isLabelDesign = this.isLabelDesign(originalPrompt);
    
    if (isLabelDesign) {
      const strongNegativePrompt = [
        'mockup', '3d rendering', 'bottle', 'package', 'container',
        'photorealistic product', 'shadows', 'perspective view',
        'mock-up', 'product photography', 'physical object',
        'realistic rendering', 'depth of field', 'studio lighting',
        'blurry', 'low quality', 'pixelated', 'compressed',
        'watermark', 'text artifacts', 'distorted typography'
      ].join(', ');

      const optimizedOptions = {
        ...options,
        styleType: 'DESIGN',
        model: 'V_2', // En yeni model
        aspectRatio: options.aspectRatio || 'ASPECT_1_1',
        magicPrompt: 'ON',
        negativePrompt: options.negativePrompt ? 
          `${options.negativePrompt}, ${strongNegativePrompt}` : 
          strongNegativePrompt
      };

      console.log('⚙️ ETIKET OPTİMİZASYONU:', {
        styleType: optimizedOptions.styleType,
        model: optimizedOptions.model,
        aspectRatio: optimizedOptions.aspectRatio,
        magicPrompt: optimizedOptions.magicPrompt,
        negativePromptLength: optimizedOptions.negativePrompt.length
      });

      return optimizedOptions;
    }
    
    // Normal tasarımlar için de kalite optimizasyonu
    return {
      ...options,
      model: options.model || 'V_2',
      styleType: options.styleType || 'DESIGN',
      magicPrompt: options.magicPrompt || 'AUTO',
      negativePrompt: options.negativePrompt ? 
        `${options.negativePrompt}, low quality, blurry, pixelated` : 
        'low quality, blurry, pixelated'
    };
  }

  // Etiket tasarımı algılama
  private isLabelDesign(prompt: string): boolean {
    const labelKeywords = [
      'etiket', 'label', 'etiketi', 'labelı', 'ürün etiketi', 'product label',
      'marka etiketi', 'brand label', 'kozmetik etiketi', 'cosmetic label',
      'gıda etiketi', 'food label', 'içecek etiketi', 'beverage label',
      'şampuan etiketi', 'parfüm etiketi', 'deterjan etiketi',
      'etiket tasarım', 'label design', 'etiket tasarla', 'sticker'
    ];
    
    const lowerPrompt = prompt.toLowerCase();
    const isLabel = labelKeywords.some(keyword => lowerPrompt.includes(keyword.toLowerCase()));
    
    console.log('🔍 Etiket algılama:', { 
      prompt: lowerPrompt, 
      isLabel,
      matchedKeywords: labelKeywords.filter(keyword => lowerPrompt.includes(keyword.toLowerCase()))
    });
    
    return isLabel;
  }

  // API yanıt doğrulama
  private validateApiResponse(response: IdeogramResponse): void {
    if (!response.data || response.data.length === 0) {
      throw new Error('API boş yanıt döndü - hiç görsel oluşturulmadı');
    }

    // Güvenlik kontrolü
    const unsafeImages = response.data.filter(img => !img.is_image_safe);
    if (unsafeImages.length > 0) {
      console.warn('⚠️ Güvenli olmayan görsel tespit edildi:', unsafeImages.length);
    }

    // URL kontrolü
    const invalidUrls = response.data.filter(img => !img.url || !img.url.startsWith('http'));
    if (invalidUrls.length > 0) {
      throw new Error('Geçersiz görsel URL\'leri tespit edildi');
    }

    console.log('✅ API yanıtı doğrulandı:', {
      totalImages: response.data.length,
      safeImages: response.data.filter(img => img.is_image_safe).length,
      validUrls: response.data.filter(img => img.url && img.url.startsWith('http')).length
    });
  }

  // Tasarım sonucu kalite kontrolü
  private validateDesignResult(response: IdeogramResponse, originalPrompt: string): IdeogramResponse {
    const isLabelDesign = this.isLabelDesign(originalPrompt);
    
    if (isLabelDesign && response.data && response.data.length > 0) {
      // Etiket tasarımları için ek validasyon
      console.log('✅ Etiket tasarımı başarıyla oluşturuldu:', {
        imageCount: response.data.length,
        allSafe: response.data.every(img => img.is_image_safe),
        originalPrompt,
        resolutions: response.data.map(img => img.resolution),
        seeds: response.data.map(img => img.seed)
      });

      // Düşük kalite kontrolü
      const lowQualityIndicators = response.data.filter(img => 
        img.resolution && (
          img.resolution.includes('512') || 
          img.resolution.includes('256')
        )
      );

      if (lowQualityIndicators.length > 0) {
        console.warn('⚠️ Düşük çözünürlük tespit edildi:', lowQualityIndicators.map(img => img.resolution));
      }
    }
    
    return response;
  }
}

export const ideogramService = new IdeogramService();
export type { IdeogramRequest, IdeogramResponse };