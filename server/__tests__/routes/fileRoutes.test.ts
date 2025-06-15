import request from 'supertest';
import app from '../../index';
import { db } from '../../db';
import { FileService } from '../../services/file';
import { PDFService } from '../../services/pdf';
import { AuthenticationError, ValidationError } from '../../errors';

// Mock services
jest.mock('../../services/file');
jest.mock('../../services/pdf');
jest.mock('../../db');

describe('File Routes', () => {
  const mockUser = {
    id: 1,
    email: 'test@example.com',
    role: 'user'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/files/upload', () => {
    it('should upload file successfully', async () => {
      const mockFile = {
        fieldname: 'file',
        originalname: 'test.pdf',
        encoding: '7bit',
        mimetype: 'application/pdf',
        buffer: Buffer.from('test'),
        size: 1024
      };

      const response = await request(app)
        .post('/api/files/upload')
        .attach('file', mockFile.buffer, {
          filename: mockFile.originalname,
          contentType: mockFile.mimetype
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('fileId');
    });

    it('should return 400 for invalid file type', async () => {
      const mockFile = {
        fieldname: 'file',
        originalname: 'test.txt',
        encoding: '7bit',
        mimetype: 'text/plain',
        buffer: Buffer.from('test'),
        size: 1024
      };

      const response = await request(app)
        .post('/api/files/upload')
        .attach('file', mockFile.buffer, {
          filename: mockFile.originalname,
          contentType: mockFile.mimetype
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });
}); 