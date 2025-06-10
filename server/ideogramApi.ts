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

      return response.data;
    } catch (error) {
      console.error('Ideogram API error:', error);
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
      // Etiket tasarımı için özel ana prompt
      const labelPrompt = `Professional product label design: ${originalPrompt}. 
        Create a clean, modern, high-quality label design with:
        - Professional typography and clear readable text
        - Balanced composition with proper spacing
        - Brand-focused graphic elements
        - Print-ready quality with sharp edges
        - Commercial product label aesthetic
        - Professional color scheme
        - Vector-style clean graphics
        - No mockup or bottle/package visualization
        - Focus purely on the flat label graphic design
        - High contrast and legibility for printing
        - Commercial printing standards`;
      
      return labelPrompt;
    }
    
    return originalPrompt;
  }

  // Etiket tasarımları için seçenek optimizasyonu
  private optimizeOptionsForLabels(originalPrompt: string, options: any): any {
    const isLabelDesign = this.isLabelDesign(originalPrompt);
    
    if (isLabelDesign) {
      return {
        ...options,
        styleType: 'DESIGN', // Etiket için her zaman DESIGN stili
        aspectRatio: options.aspectRatio || 'ASPECT_1_1', // Kare format varsayılan
        magicPrompt: 'ON', // Magic prompt aktif
        negativePrompt: (options.negativePrompt || '') + 
          ', mockup, 3d rendering, bottle, package, container, photorealistic product, shadows, perspective view, mock-up, product photography, physical object'
      };
    }
    
    return options;
  }

  // Etiket tasarımı algılama
  private isLabelDesign(prompt: string): boolean {
    const labelKeywords = [
      'etiket', 'label', 'etiketi', 'labelı', 'ürün etiketi', 'product label',
      'marka etiketi', 'brand label', 'kozmetik etiketi', 'cosmetic label',
      'gıda etiketi', 'food label', 'içecek etiketi', 'beverage label',
      'şampuan etiketi', 'parfüm etiketi', 'deterjan etiketi',
      'etiket tasarım', 'label design', 'etiket tasarla'
    ];
    
    const lowerPrompt = prompt.toLowerCase();
    return labelKeywords.some(keyword => lowerPrompt.includes(keyword.toLowerCase()));
  }
}

export const ideogramService = new IdeogramService();
export type { IdeogramRequest, IdeogramResponse };