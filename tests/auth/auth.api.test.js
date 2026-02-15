const request = require('supertest');
const createTestApp = require('../utils/createTestApp');

jest.mock('../../models/userModel', () => ({
  getUserByEmail: jest.fn(),
  createUser: jest.fn(),
  getUserProfileById: jest.fn()
}));

jest.mock('../../services/authService', () => ({
  hashPassword: jest.fn(),
  comparePassword: jest.fn(),
  signToken: jest.fn()
}));

const userModel = require('../../models/userModel');
const authService = require('../../services/authService');

describe('Authentication API', () => {
  const app = createTestApp();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('registers successfully', async () => {
    userModel.getUserByEmail.mockResolvedValue(null);
    authService.hashPassword.mockResolvedValue('hashed');
    userModel.createUser.mockResolvedValue({ id: 10, role: 'user' });
    authService.signToken.mockReturnValue('jwt-token');

    const res = await request(app).post('/auth/register').send({ email: 'new@example.com', password: 'StrongPass1!' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBe('jwt-token');
  });

  test('rejects duplicate email', async () => {
    userModel.getUserByEmail.mockResolvedValue({ id: 1 });

    const res = await request(app).post('/auth/register').send({ email: 'exists@example.com', password: 'StrongPass1!' });

    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/already in use/i);
  });

  test('rejects invalid email format', async () => {
    const res = await request(app).post('/auth/register').send({ email: 'bad-email', password: 'StrongPass1!' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/invalid email/i);
  });

  test('handles weak password path (missing password)', async () => {
    const res = await request(app).post('/auth/register').send({ email: 'weak@example.com', password: '' });

    expect(res.status).toBe(400);
  });

  test('logs in with correct credentials and returns token', async () => {
    userModel.getUserByEmail.mockResolvedValue({ id: 12, is_active: true, password_hash: 'hash', role: 'user' });
    authService.comparePassword.mockResolvedValue(true);
    authService.signToken.mockReturnValue('login-token');
    userModel.getUserProfileById.mockResolvedValue({ email: 'u@x.com' });

    const res = await request(app).post('/auth/login').send({ email: 'u@x.com', password: 'secret' });

    expect(res.status).toBe(200);
    expect(res.body.data.token).toBe('login-token');
  });

  test('rejects wrong password', async () => {
    userModel.getUserByEmail.mockResolvedValue({ id: 12, is_active: true, password_hash: 'hash', role: 'user' });
    authService.comparePassword.mockResolvedValue(false);

    const res = await request(app).post('/auth/login').send({ email: 'u@x.com', password: 'wrong' });

    expect(res.status).toBe(401);
  });

  test('rejects non-existent user', async () => {
    userModel.getUserByEmail.mockResolvedValue(null);

    const res = await request(app).post('/auth/login').send({ email: 'no@x.com', password: 'wrong' });

    expect(res.status).toBe(401);
  });
});
