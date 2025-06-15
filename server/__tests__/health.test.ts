import request from 'supertest';
import app from '../index';

describe('Health Check Endpoint', () => {
  it('should return 200 OK', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.text).toBe('PrintBroker API Çalışıyor!');
  });
}); 