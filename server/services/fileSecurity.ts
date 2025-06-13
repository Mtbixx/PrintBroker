import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config';
import { encryptionService } from './encryption';

export class FileSecurityService {
  private readonly uploadDir: string;
  private readonly allowedMimeTypes: string[];
  private readonly maxFileSize: number;

  constructor() {
    this.uploadDir = config.upload.dir;
    this.allowedMimeTypes = config.upload.allowedMimeTypes;
    this.maxFileSize = config.upload.maxFileSize;

    // Upload dizinini oluştur
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  // Dosya yükleme
  async uploadFile(file: Express.Multer.File, userId: string): Promise<string> {
    try {
      // Dosya boyutu kontrolü
      if (file.size > this.maxFileSize) {
        throw new Error('Dosya boyutu çok büyük');
      }

      // MIME tipi kontrolü
      if (!this.allowedMimeTypes.includes(file.mimetype)) {
        throw new Error('Desteklenmeyen dosya tipi');
      }

      // Güvenli dosya adı oluştur
      const fileExtension = path.extname(file.originalname);
      const fileName = `${uuidv4()}${fileExtension}`;
      const filePath = path.join(this.uploadDir, userId, fileName);

      // Kullanıcı dizinini oluştur
      const userDir = path.join(this.uploadDir, userId);
      if (!fs.existsSync(userDir)) {
        fs.mkdirSync(userDir, { recursive: true });
      }

      // Dosyayı şifrele ve kaydet
      const encryptedData = encryptionService.encrypt(file.buffer.toString('base64'));
      await fs.promises.writeFile(
        filePath,
        JSON.stringify(encryptedData),
        'utf8'
      );

      return fileName;
    } catch (error) {
      console.error('Dosya yükleme hatası:', error);
      throw new Error('Dosya yüklenirken bir hata oluştu');
    }
  }

  // Dosya indirme
  async downloadFile(fileName: string, userId: string): Promise<Buffer> {
    try {
      const filePath = path.join(this.uploadDir, userId, fileName);

      // Dosya varlığını kontrol et
      if (!fs.existsSync(filePath)) {
        throw new Error('Dosya bulunamadı');
      }

      // Şifrelenmiş veriyi oku
      const encryptedData = JSON.parse(
        await fs.promises.readFile(filePath, 'utf8')
      );

      // Şifreyi çöz
      const decryptedData = encryptionService.decrypt(
        encryptedData.encrypted,
        encryptedData.iv
      );

      return Buffer.from(decryptedData, 'base64');
    } catch (error) {
      console.error('Dosya indirme hatası:', error);
      throw new Error('Dosya indirilirken bir hata oluştu');
    }
  }

  // Dosya silme
  async deleteFile(fileName: string, userId: string): Promise<void> {
    try {
      const filePath = path.join(this.uploadDir, userId, fileName);

      // Dosya varlığını kontrol et
      if (!fs.existsSync(filePath)) {
        throw new Error('Dosya bulunamadı');
      }

      // Dosyayı sil
      await fs.promises.unlink(filePath);
    } catch (error) {
      console.error('Dosya silme hatası:', error);
      throw new Error('Dosya silinirken bir hata oluştu');
    }
  }

  // Kullanıcı dosyalarını listele
  async listUserFiles(userId: string): Promise<string[]> {
    try {
      const userDir = path.join(this.uploadDir, userId);

      // Kullanıcı dizini kontrolü
      if (!fs.existsSync(userDir)) {
        return [];
      }

      // Dosyaları listele
      const files = await fs.promises.readdir(userDir);
      return files;
    } catch (error) {
      console.error('Dosya listeleme hatası:', error);
      throw new Error('Dosyalar listelenirken bir hata oluştu');
    }
  }

  // Dosya hash'i oluştur
  async createFileHash(filePath: string): Promise<string> {
    return encryptionService.createFileHash(filePath);
  }

  // Dosya bütünlüğünü doğrula
  async verifyFileIntegrity(filePath: string, expectedHash: string): Promise<boolean> {
    const actualHash = await this.createFileHash(filePath);
    return actualHash === expectedHash;
  }

  // Dosya tipini doğrula
  validateFileType(mimeType: string): boolean {
    return this.allowedMimeTypes.includes(mimeType);
  }

  // Dosya boyutunu doğrula
  validateFileSize(size: number): boolean {
    return size <= this.maxFileSize;
  }
}

export const fileSecurityService = new FileSecurityService(); 