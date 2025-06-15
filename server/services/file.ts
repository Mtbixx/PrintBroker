import { db } from '../db';
import { File } from '../types';

export class FileService {
  async uploadFile(file: Express.Multer.File, userId: number): Promise<File> {
    // Dosya yükleme işlemleri burada yapılacak
    const uploadedFile = await db.files.create({
      data: {
        userId,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        path: `/uploads/${file.filename}`
      }
    });

    return uploadedFile;
  }

  async getFile(fileId: number): Promise<File | null> {
    return db.files.findUnique({
      where: { id: fileId }
    });
  }

  async deleteFile(fileId: number): Promise<void> {
    await db.files.delete({
      where: { id: fileId }
    });
  }
} 