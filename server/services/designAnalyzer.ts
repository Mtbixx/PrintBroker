import { createReadStream } from 'fs';
import { stat } from 'fs/promises';
import { config } from '../config';
import sharp from 'sharp';

export class DesignAnalyzerService {
  private static instance: DesignAnalyzerService;

  private constructor() {}

  public static getInstance(): DesignAnalyzerService {
    if (!DesignAnalyzerService.instance) {
      DesignAnalyzerService.instance = new DesignAnalyzerService();
    }
    return DesignAnalyzerService.instance;
  }

  public async analyzeDesign(filePath: string): Promise<{
    dimensions: { width: number; height: number };
    colorCount: number;
    hasTransparency: boolean;
    isVector: boolean;
    fileSize: number;
    format: string;
  }> {
    try {
      // Dosya boyutunu kontrol et
      const stats = await stat(filePath);
      if (stats.size > config.upload.maxFileSize) {
        throw new Error('Tasarım dosyası çok büyük');
      }

      // Dosya formatını belirle
      const format = this.determineFormat(filePath);
      const isVector = this.isVectorFormat(format);

      if (isVector) {
        return this.analyzeVectorFile(filePath, format, stats.size);
      } else {
        return this.analyzeRasterFile(filePath, format, stats.size);
      }
    } catch (error) {
      console.error('Tasarım analiz hatası:', error);
      throw error;
    }
  }

  private determineFormat(filePath: string): string {
    const ext = filePath.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'ai':
        return 'illustrator';
      case 'psd':
        return 'photoshop';
      case 'indd':
        return 'indesign';
      case 'pdf':
        return 'pdf';
      case 'jpg':
      case 'jpeg':
        return 'jpeg';
      case 'png':
        return 'png';
      case 'gif':
        return 'gif';
      default:
        throw new Error('Desteklenmeyen dosya formatı');
    }
  }

  private isVectorFormat(format: string): boolean {
    return ['illustrator', 'indesign', 'pdf'].includes(format);
  }

  private async analyzeVectorFile(
    filePath: string,
    format: string,
    fileSize: number
  ): Promise<{
    dimensions: { width: number; height: number };
    colorCount: number;
    hasTransparency: boolean;
    isVector: boolean;
    fileSize: number;
    format: string;
  }> {
    // Vektör dosyaları için basit analiz
    return {
      dimensions: { width: 0, height: 0 }, // Vektör dosyaları için boyut analizi yapılamıyor
      colorCount: 0, // Vektör dosyaları için renk sayısı analizi yapılamıyor
      hasTransparency: true, // Vektör dosyaları genellikle şeffaflık destekler
      isVector: true,
      fileSize,
      format
    };
  }

  private async analyzeRasterFile(
    filePath: string,
    format: string,
    fileSize: number
  ): Promise<{
    dimensions: { width: number; height: number };
    colorCount: number;
    hasTransparency: boolean;
    isVector: boolean;
    fileSize: number;
    format: string;
  }> {
    const image = sharp(filePath);
    const metadata = await image.metadata();

    // Renk sayısını hesapla
    const { dominant } = await image.stats();
    const colorCount = Object.keys(dominant).length;

    return {
      dimensions: {
        width: metadata.width || 0,
        height: metadata.height || 0
      },
      colorCount,
      hasTransparency: metadata.hasAlpha || false,
      isVector: false,
      fileSize,
      format
    };
  }

  public async optimizeDesign(
    filePath: string,
    options: {
      quality?: number;
      format?: 'jpeg' | 'png' | 'webp';
      resize?: { width?: number; height?: number };
    } = {}
  ): Promise<Buffer> {
    try {
      let image = sharp(filePath);

      // Boyutlandırma
      if (options.resize) {
        image = image.resize(options.resize);
      }

      // Format dönüşümü ve optimizasyon
      switch (options.format) {
        case 'jpeg':
          return image.jpeg({ quality: options.quality || 80 }).toBuffer();
        case 'png':
          return image.png({ quality: options.quality || 80 }).toBuffer();
        case 'webp':
          return image.webp({ quality: options.quality || 80 }).toBuffer();
        default:
          return image.toBuffer();
      }
    } catch (error) {
      console.error('Tasarım optimizasyon hatası:', error);
      throw error;
    }
  }
}

export const designAnalyzerService = DesignAnalyzerService.getInstance(); 