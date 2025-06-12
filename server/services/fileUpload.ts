import { createWriteStream } from 'fs';
import { mkdir, stat } from 'fs/promises';
import { join } from 'path';
import { pipeline } from 'stream/promises';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config';

export class FileUploadService {
  private static instance: FileUploadService;
  private uploadDir: string;

  private constructor() {
    this.uploadDir = config.upload.dir;
  }

  public static getInstance(): FileUploadService {
    if (!FileUploadService.instance) {
      FileUploadService.instance = new FileUploadService();
    }
    return FileUploadService.instance;
  }

  public async saveFile(file: Express.Multer.File, userId: string): Promise<{
    path: string;
    originalName: string;
    mimeType: string;
    size: number;
  }> {
    try {
      // Kullanıcıya özel dizin oluştur
      const userDir = join(this.uploadDir, userId);
      await mkdir(userDir, { recursive: true });

      // Benzersiz dosya adı oluştur
      const fileExt = file.originalname.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = join(userDir, fileName);

      // Dosyayı kaydet
      await pipeline(
        file.stream,
        createWriteStream(filePath)
      );

      // Dosya boyutunu kontrol et
      const stats = await stat(filePath);
      if (stats.size > config.upload.maxFileSize) {
        throw new Error('Dosya boyutu çok büyük');
      }

      return {
        path: filePath,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: stats.size
      };
    } catch (error) {
      console.error('Dosya yükleme hatası:', error);
      throw error;
    }
  }

  public async validateFile(file: Express.Multer.File): Promise<void> {
    // Dosya tipini kontrol et
    if (!config.upload.allowedMimeTypes.includes(file.mimetype)) {
      throw new Error('Desteklenmeyen dosya tipi');
    }

    // Dosya boyutunu kontrol et
    if (file.size > config.upload.maxFileSize) {
      throw new Error('Dosya boyutu çok büyük');
    }
  }

  public getFileStream(filePath: string): NodeJS.ReadableStream {
    return createReadStream(filePath);
  }
}

export const fileUploadService = FileUploadService.getInstance(); 