import request from 'supertest';
import app from '../index';

describe('API v1 Health Endpoint', () => {
  it('should return status ok and version v1', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('version', 'v1');
  });
}); 