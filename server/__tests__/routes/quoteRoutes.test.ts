import request from 'supertest';
import { app } from '../../index';
import { DatabaseStorage } from '../../storage/database';
import { AuthenticationError, ValidationError, NotFoundError } from '../../errors';

// Mock DatabaseStorage
jest.mock('../../storage/database');

describe('Quote Routes', () => {
  const mockUser = {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    role: 'user'
  };

  const mockQuote = {
    id: '1',
    userId: '1',
    fileId: '1',
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/quotes', () => {
    it('should create a new quote successfully', async () => {
      const quoteData = {
        fileId: '1',
        description: 'Test quote'
      };

      (DatabaseStorage.prototype.createQuote as jest.Mock).mockResolvedValue({
        id: '1',
        ...quoteData,
        userId: mockUser.id,
        status: 'pending',
        createdAt: expect.any(String)
      });

      const response = await request(app)
        .post('/api/quotes')
        .set('Authorization', 'Bearer test-token')
        .send(quoteData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.fileId).toBe(quoteData.fileId);
    });

    it('should return validation error for invalid input', async () => {
      const quoteData = {
        fileId: '',
        description: ''
      };

      const response = await request(app)
        .post('/api/quotes')
        .set('Authorization', 'Bearer test-token')
        .send(quoteData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('ValidationError');
    });
  });

  describe('GET /api/quotes', () => {
    it('should get all quotes for user', async () => {
      (DatabaseStorage.prototype.getQuotesForUser as jest.Mock).mockResolvedValue([mockQuote]);

      const response = await request(app)
        .get('/api/quotes')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body[0]).toEqual(mockQuote);
    });

    it('should return authentication error without token', async () => {
      const response = await request(app)
        .get('/api/quotes');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('AuthenticationError');
    });
  });

  describe('GET /api/quotes/:id', () => {
    it('should get quote by id', async () => {
      (DatabaseStorage.prototype.getQuoteById as jest.Mock).mockResolvedValue(mockQuote);

      const response = await request(app)
        .get('/api/quotes/1')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockQuote);
    });

    it('should return not found error for non-existent quote', async () => {
      (DatabaseStorage.prototype.getQuoteById as jest.Mock).mockRejectedValue(
        new NotFoundError('Teklif bulunamadı')
      );

      const response = await request(app)
        .get('/api/quotes/999')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('NotFoundError');
    });
  });

  describe('GET /api/quotes/:id/printers', () => {
    it('should get printer quotes for a quote', async () => {
      const mockPrinterQuotes = [
        {
          id: '1',
          quoteId: '1',
          printerId: '1',
          price: 100,
          status: 'pending'
        }
      ];

      (DatabaseStorage.prototype.getPrinterQuotesForQuote as jest.Mock).mockResolvedValue(mockPrinterQuotes);

      const response = await request(app)
        .get('/api/quotes/1/printers')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body[0]).toEqual(mockPrinterQuotes[0]);
    });

    it('should return not found error for non-existent quote', async () => {
      (DatabaseStorage.prototype.getPrinterQuotesForQuote as jest.Mock).mockRejectedValue(
        new NotFoundError('Teklif bulunamadı')
      );

      const response = await request(app)
        .get('/api/quotes/999/printers')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('NotFoundError');
    });
  });
}); 