import axios from 'axios';

interface IdeogramV3Request {
  image_request: {
    prompt: string;
    aspect_ratio?: 'ASPECT_1_1' | 'ASPECT_10_16' | 'ASPECT_16_10' | 'ASPECT_9_16' | 'ASPECT_16_9' | 'ASPECT_3_2' | 'ASPECT_2_3' | 'ASPECT_4_3' | 'ASPECT_3_4';
    model: 'V_3';
    magic_prompt_option?: 'AUTO' | 'ON' | 'OFF';
    seed?: number;
    style_type?: 'AUTO' | 'GENERAL' | 'REALISTIC' | 'DESIGN' | 'RENDER_3D' | 'ANIME';
    negative_prompt?: string;
    resolution?: 'RESOLUTION_512_1536' | 'RESOLUTION_576_1408' | 'RESOLUTION_640_1024' | 'RESOLUTION_768_1024' | 'RESOLUTION_1024_1024' | 'RESOLUTION_1152_896' | 'RESOLUTION_1216_832' | 'RESOLUTION_1344_768' | 'RESOLUTION_1536_640';
    color_palette?: {
      name?: string;
      members?: Array<{
        color: string;
        weight?: number;
      }>;
    };
  };
}

interface IdeogramV3Response {
  created: string;
  data: Array<{
    url: string;
    is_image_safe: boolean;
    prompt: string;
    resolution: string;
    seed: number;
    style_type?: string;
    model?: string;
  }>;
}

class IdeogramService {
  private apiKey: string;
  private baseUrl = 'https://api.ideogram.ai/v1/ideogram-v3/generate';

  constructor() {
    this.apiKey = 'X3h2wLDuOfuJynGGclLZhLN1isGvy9oxBM-S8wcNJVTqk80lyW6pszMShoMHP8YbN7DYSfzti7eTLL-KCExqZw';
    if (!this.apiKey) {
      console.warn('IDEOGRAM_API_KEY environment variable not set - design generation will be disabled');
    }
  }

  async generateImage(prompt: string, options: {
    aspectRatio?: 'ASPECT_1_1' | 'ASPECT_10_16' | 'ASPECT_16_10' | 'ASPECT_9_16' | 'ASPECT_16_9' | 'ASPECT_3_2' | 'ASPECT_2_3' | 'ASPECT_4_3' | 'ASPECT_3_4';
    styleType?: 'AUTO' | 'GENERAL' | 'REALISTIC' | 'DESIGN' | 'RENDER_3D' | 'ANIME';
    magicPrompt?: 'AUTO' | 'ON' | 'OFF';
    negativePrompt?: string;
    seed?: number;
    resolution?: 'RESOLUTION_512_1536' | 'RESOLUTION_576_1408' | 'RESOLUTION_640_1024' | 'RESOLUTION_768_1024' | 'RESOLUTION_1024_1024' | 'RESOLUTION_1152_896' | 'RESOLUTION_1216_832' | 'RESOLUTION_1344_768' | 'RESOLUTION_1536_640';
    colorPalette?: {
      name?: string;
      members?: Array<{
        color: string;
        weight?: number;
      }>;
    };
  } = {}): Promise<IdeogramV3Response> {
    if (!this.apiKey) {
      throw new Error('Ideogram API key not configured. Please contact administrator.');
    }

    try {
      console.log('🎯 Ideogram API v3 Request:', {
        prompt,
        options
      });

      const requestData: IdeogramV3Request = {
        image_request: {
          prompt: prompt,
          aspect_ratio: options.aspectRatio || 'ASPECT_1_1',
          model: 'V_3',
          style_type: options.styleType || 'AUTO',
          magic_prompt_option: options.magicPrompt || 'AUTO',
          negative_prompt: options.negativePrompt,
          seed: options.seed,
          resolution: options.resolution,
          color_palette: options.colorPalette,
        }
      };

      console.log('🚀 V3 API Request Data:', JSON.stringify(requestData, null, 2));

      const response = await axios.post<IdeogramV3Response>(
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

      console.log('📊 Ideogram API v3 Response:', {
        status: response.status,
        dataCount: response.data.data?.length || 0,
        created: response.data.created,
        model: response.data.data[0]?.model,
        styleType: response.data.data[0]?.style_type
      });

      return response.data;
    } catch (error) {
      console.error('❌ Ideogram API v3 Error:', {
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
        throw new Error(`Ideogram API v3 Error (${error.response.status}): ${JSON.stringify(error.response.data)}`);
      }

      throw new Error('Failed to generate image with Ideogram API v3');
    }
  }

  async generateMultipleImages(prompts: string[], options: Parameters<typeof this.generateImage>[1] = {}): Promise<IdeogramV3Response[]> {
    const promises = prompts.map(prompt => this.generateImage(prompt, options));
    return Promise.all(promises);
  }

  async generateBatch(requests: Array<{ prompt: string; options?: Parameters<typeof this.generateImage>[1] }>, batchSize = 3): Promise<IdeogramV3Response[]> {
    if (!this.apiKey) {
      throw new Error('Ideogram API key not configured. Please contact administrator.');
    }

    const results: IdeogramV3Response[] = [];

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

  // V3 specific features
  async generateWithColorPalette(prompt: string, colors: string[], options: Parameters<typeof this.generateImage>[1] = {}): Promise<IdeogramV3Response> {
    const colorPalette = {
      members: colors.map(color => ({
        color: color,
        weight: 1
      }))
    };

    return this.generateImage(prompt, {
      ...options,
      colorPalette
    });
  }

  async generateHighResolution(prompt: string, resolution: 'RESOLUTION_1024_1024' | 'RESOLUTION_1344_768' | 'RESOLUTION_1536_640', options: Parameters<typeof this.generateImage>[1] = {}): Promise<IdeogramV3Response> {
    return this.generateImage(prompt, {
      ...options,
      resolution
    });
  }

  async generateWithAdvancedStyle(prompt: string, styleType: 'GENERAL' | 'REALISTIC' | 'DESIGN' | 'RENDER_3D' | 'ANIME', options: Parameters<typeof this.generateImage>[1] = {}): Promise<IdeogramV3Response> {
    return this.generateImage(prompt, {
      ...options,
      styleType
    });
  }
}

export const ideogramService = new IdeogramService();
export type { IdeogramV3Request, IdeogramV3Response };