import { PDFDocument } from 'pdf-lib';
import { createReadStream } from 'fs';
import { stat } from 'fs/promises';
import { config } from '../config';
import { File } from '../types';

export class PDFService {
  private static instance: PDFService;

  private constructor() {}

  public static getInstance(): PDFService {
    if (!PDFService.instance) {
      PDFService.instance = new PDFService();
    }
    return PDFService.instance;
  }

  public async analyzePDF(file: File): Promise<any> {
    // PDF analiz işlemleri burada yapılacak
    return {
      pageCount: 1,
      dimensions: { width: 595, height: 842 },
      colorMode: 'RGB'
    };
  }

  public async validatePDF(file: File): Promise<boolean> {
    // PDF doğrulama işlemleri burada yapılacak
    return true;
  }

  public async analyzePDF(filePath: string): Promise<{
    pageCount: number;
    dimensions: { width: number; height: number };
    colorMode: 'RGB' | 'CMYK' | 'Grayscale';
    fileSize: number;
    isEncrypted: boolean;
  }> {
    try {
      // Dosya boyutunu kontrol et
      const stats = await stat(filePath);
      if (stats.size > config.upload.maxFileSize) {
        throw new Error('PDF dosyası çok büyük');
      }

      // PDF'i yükle
      const pdfBytes = await createReadStream(filePath).read();
      const pdfDoc = await PDFDocument.load(pdfBytes);

      // Sayfa sayısını al
      const pageCount = pdfDoc.getPageCount();

      // İlk sayfanın boyutlarını al
      const firstPage = pdfDoc.getPage(0);
      const { width, height } = firstPage.getSize();

      // Renk modunu belirle
      const colorMode = this.determineColorMode(pdfDoc);

      return {
        pageCount,
        dimensions: { width, height },
        colorMode,
        fileSize: stats.size,
        isEncrypted: pdfDoc.isEncrypted
      };
    } catch (error) {
      console.error('PDF analiz hatası:', error);
      throw error;
    }
  }

  private determineColorMode(pdfDoc: PDFDocument): 'RGB' | 'CMYK' | 'Grayscale' {
    // PDF'in renk uzayını kontrol et
    const firstPage = pdfDoc.getPage(0);
    const { colorSpace } = firstPage;

    if (colorSpace === 'DeviceCMYK') {
      return 'CMYK';
    } else if (colorSpace === 'DeviceGray') {
      return 'Grayscale';
    } else {
      return 'RGB';
    }
  }

  public async optimizePDF(filePath: string, options: {
    compress?: boolean;
    removeMetadata?: boolean;
    quality?: 'low' | 'medium' | 'high';
  } = {}): Promise<Buffer> {
    try {
      const pdfBytes = await createReadStream(filePath).read();
      const pdfDoc = await PDFDocument.load(pdfBytes);

      // Metadata'yı kaldır
      if (options.removeMetadata) {
        pdfDoc.setTitle('');
        pdfDoc.setAuthor('');
        pdfDoc.setSubject('');
        pdfDoc.setKeywords([]);
        pdfDoc.setProducer('');
        pdfDoc.setCreator('');
      }

      // Sıkıştırma seviyesini ayarla
      const saveOptions = {
        useObjectStreams: options.compress,
        addDefaultPage: false,
        objectsPerTick: options.quality === 'high' ? 50 : 20
      };

      // PDF'i optimize et
      const optimizedPdfBytes = await pdfDoc.save(saveOptions);
      return Buffer.from(optimizedPdfBytes);
    } catch (error) {
      console.error('PDF optimizasyon hatası:', error);
      throw error;
    }
  }
}

export const pdfService = PDFService.getInstance(); 