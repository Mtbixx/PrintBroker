import axios from 'axios';
import FormData from 'form-data';
import OpenAI from 'openai';

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
  private openai: OpenAI | null = null;

  constructor() {
    this.apiKey = 'X3h2wLDuOfuJynGGclLZhLN1isGvy9oxBM-S8wcNJVTqk80lyW6pszMShoMHP8YbN7DYSfzti7eTLL-KCExqZw';
    if (!this.apiKey) {
      console.warn('IDEOGRAM_API_KEY environment variable not set - design generation will be disabled');
    }

    // OpenAI DALL-E entegrasyonu
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
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
      console.log('🎯 Ideogram API Request:', {
        prompt,
        options
      });

      const requestData: IdeogramRequest = {
        image_request: {
          prompt: prompt,
          aspect_ratio: options.aspectRatio || 'ASPECT_1_1',
          model: options.model || 'V_2',
          style_type: options.styleType || 'AUTO',
          magic_prompt_option: options.magicPrompt || 'AUTO',
          negative_prompt: options.negativePrompt,
          seed: options.seed,
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
          timeout: 60000,
        }
      );

      console.log('📊 Ideogram API Response:', {
        status: response.status,
        dataCount: response.data.data?.length || 0,
        created: response.data.created
      });

      return response.data;
    } catch (error) {
      console.error('❌ Ideogram API Error:', {
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

      if (i + batchSize < requests.length) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    return results;
  }

  async generateWithDALLE(prompt: string, options: {
    size?: '1024x1024' | '1792x1024' | '1024x1792';
    quality?: 'standard' | 'hd';
    style?: 'vivid' | 'natural';
  } = {}): Promise<IdeogramResponse> {
    if (!this.openai) {
      throw new Error('OpenAI API key not configured for DALL-E generation.');
    }

    try {
      console.log('🎨 DALL-E API Request:', { prompt, options });

      const response = await this.openai.images.generate({
        model: 'dall-e-3',
        prompt: prompt,
        size: options.size || '1024x1024',
        quality: options.quality || 'standard',
        style: options.style || 'vivid',
        n: 1,
      });

      const dalleResult = response.data[0];
      
      // Ideogram formatına dönüştür
      const ideogramResponse: IdeogramResponse = {
        created: new Date().toISOString(),
        data: [{
          url: dalleResult.url!,
          is_image_safe: true,
          prompt: dalleResult.revised_prompt || prompt,
          resolution: options.size || '1024x1024',
          seed: Math.floor(Math.random() * 1000000)
        }]
      };

      console.log('📊 DALL-E API Response Success');
      return ideogramResponse;

    } catch (error) {
      console.error('❌ DALL-E API Error:', error);
      throw new Error('Failed to generate image with DALL-E API');
    }
  }

  async generateMultiProvider(prompt: string, providers: ('ideogram' | 'dalle')[] = ['ideogram'], options: any = {}): Promise<IdeogramResponse[]> {
    const results: IdeogramResponse[] = [];
    
    for (const provider of providers) {
      try {
        if (provider === 'ideogram') {
          const result = await this.generateImage(prompt, options);
          results.push(result);
        } else if (provider === 'dalle') {
          const result = await this.generateWithDALLE(prompt, options);
          results.push(result);
        }
      } catch (error) {
        console.error(`❌ ${provider} generation failed:`, error);
        // Devam et, diğer provider'ları dene
      }
    }

    return results;
  }
}

export const ideogramService = new IdeogramService();
export type { IdeogramRequest, IdeogramResponse };