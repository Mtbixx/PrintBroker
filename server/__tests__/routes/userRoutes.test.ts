import request from 'supertest';
import { app } from '../../index';
import { DatabaseStorage } from '../../storage/database';
import { AuthenticationError, ValidationError } from '../../errors';

// Mock DatabaseStorage
jest.mock('../../storage/database');

describe('User Routes', () => {
  const mockUser = {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    role: 'user'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/users/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'new@example.com',
        password: 'password123',
        name: 'New User'
      };

      (DatabaseStorage.prototype.createUser as jest.Mock).mockResolvedValue({
        id: '2',
        ...userData
      });

      const response = await request(app)
        .post('/api/users/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.email).toBe(userData.email);
    });

    it('should return validation error for invalid input', async () => {
      const userData = {
        email: 'invalid-email',
        password: '123',
        name: ''
      };

      const response = await request(app)
        .post('/api/users/register')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('ValidationError');
    });
  });

  describe('POST /api/users/login', () => {
    it('should login user successfully', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      (DatabaseStorage.prototype.authenticateUser as jest.Mock).mockResolvedValue({
        user: mockUser,
        token: 'test-token'
      });

      const response = await request(app)
        .post('/api/users/login')
        .send(loginData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toEqual(mockUser);
    });

    it('should return authentication error for invalid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrong-password'
      };

      (DatabaseStorage.prototype.authenticateUser as jest.Mock).mockRejectedValue(
        new AuthenticationError('Geçersiz kimlik bilgileri')
      );

      const response = await request(app)
        .post('/api/users/login')
        .send(loginData);

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('AuthenticationError');
    });
  });

  describe('GET /api/users/profile', () => {
    it('should get user profile with valid token', async () => {
      (DatabaseStorage.prototype.getUserById as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUser);
    });

    it('should return authentication error without token', async () => {
      const response = await request(app)
        .get('/api/users/profile');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('AuthenticationError');
    });
  });
}); 