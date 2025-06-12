import request from 'supertest';
import { app } from '../../index';
import { DatabaseStorage } from '../../storage/database';
import { FileStorage } from '../../storage/file';
import { ProfessionalPDFProcessor } from '../../services/pdf';
import { AuthenticationError, ValidationError, NotFoundError, FileProcessingError } from '../../errors';
import path from 'path';

// Mock dependencies
jest.mock('../../storage/database');
jest.mock('../../storage/file');
jest.mock('../../services/pdf');

describe('File Routes', () => {
  const mockUser = {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    role: 'user'
  };

  const mockFile = {
    id: '1',
    userId: '1',
    originalName: 'test.pdf',
    mimeType: 'application/pdf',
    size: 1024,
    path: '/uploads/test.pdf',
    createdAt: new Date().toISOString()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/files/upload', () => {
    it('should upload file successfully', async () => {
      const filePath = path.join(__dirname, '../../__tests__/fixtures/test.pdf');
      
      (FileStorage.prototype.saveFile as jest.Mock).mockResolvedValue(mockFile);
      (DatabaseStorage.prototype.createFile as jest.Mock).mockResolvedValue(mockFile);

      const response = await request(app)
        .post('/api/files/upload')
        .set('Authorization', 'Bearer test-token')
        .attach('file', filePath);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockFile);
    });

    it('should return validation error when no file is uploaded', async () => {
      const response = await request(app)
        .post('/api/files/upload')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('ValidationError');
    });
  });

  describe('POST /api/files/:id/analyze-pdf', () => {
    it('should analyze PDF file successfully', async () => {
      const mockAnalysis = {
        pageCount: 5,
        dimensions: { width: 595, height: 842 },
        colorMode: 'RGB'
      };

      (DatabaseStorage.prototype.getFile as jest.Mock).mockResolvedValue(mockFile);
      (ProfessionalPDFProcessor.prototype.analyzePDF as jest.Mock).mockResolvedValue(mockAnalysis);

      const response = await request(app)
        .post('/api/files/1/analyze-pdf')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockAnalysis);
    });

    it('should return not found error for non-existent file', async () => {
      (DatabaseStorage.prototype.getFile as jest.Mock).mockRejectedValue(
        new NotFoundError('Dosya bulunamadı')
      );

      const response = await request(app)
        .post('/api/files/999/analyze-pdf')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('NotFoundError');
    });
  });

  describe('POST /api/files/:id/analyze-design', () => {
    it('should analyze design file successfully', async () => {
      const mockAnalysis = {
        colorCount: 5,
        hasTransparency: false,
        isVector: true
      };

      (DatabaseStorage.prototype.getFile as jest.Mock).mockResolvedValue(mockFile);
      (ProfessionalPDFProcessor.prototype.analyzeDesign as jest.Mock).mockResolvedValue(mockAnalysis);

      const response = await request(app)
        .post('/api/files/1/analyze-design')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockAnalysis);
    });

    it('should return file processing error for invalid file', async () => {
      (DatabaseStorage.prototype.getFile as jest.Mock).mockResolvedValue(mockFile);
      (ProfessionalPDFProcessor.prototype.analyzeDesign as jest.Mock).mockRejectedValue(
        new FileProcessingError('Dosya işlenemedi')
      );

      const response = await request(app)
        .post('/api/files/1/analyze-design')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('FileProcessingError');
    });
  });

  describe('GET /api/files/:id/download', () => {
    it('should download file successfully', async () => {
      (DatabaseStorage.prototype.getFile as jest.Mock).mockResolvedValue(mockFile);
      (FileStorage.prototype.getFileStream as jest.Mock).mockResolvedValue({
        stream: 'mock-stream',
        contentType: 'application/pdf'
      });

      const response = await request(app)
        .get('/api/files/1/download')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(200);
      expect(response.header['content-type']).toBe('application/pdf');
    });

    it('should return not found error for non-existent file', async () => {
      (DatabaseStorage.prototype.getFile as jest.Mock).mockRejectedValue(
        new NotFoundError('Dosya bulunamadı')
      );

      const response = await request(app)
        .get('/api/files/999/download')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('NotFoundError');
    });
  });
}); 