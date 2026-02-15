const request = require('supertest');
const createTestApp = require('../utils/createTestApp');
const { makeToken } = require('../utils/token');
const { profile, languages } = require('../mocks/mockData');

jest.mock('../../models/userModel', () => ({
  getUserProfileById: jest.fn(),
  updateUserLanguages: jest.fn()
}));

jest.mock('../../models/languageModel', () => ({
  getLanguageById: jest.fn(),
  getAllLanguages: jest.fn()
}));

const userModel = require('../../models/userModel');
const languageModel = require('../../models/languageModel');

describe('Profile & onboarding API', () => {
  const app = createTestApp();
  const token = makeToken({ user_id: 9, role: 'user' }, 'change-me-in-production');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('requires token on protected profile route', async () => {
    const res = await request(app).get('/profile');
    expect(res.status).toBe(401);
  });

  test('loads profile successfully', async () => {
    userModel.getUserProfileById.mockResolvedValue(profile);

    const res = await request(app).get('/profile').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe(profile.email);
  });

  test('saves language selection and enforces native != learning', async () => {
    languageModel.getLanguageById
      .mockResolvedValueOnce(languages[0])
      .mockResolvedValueOnce(languages[1])
      .mockResolvedValueOnce(languages[0]);

    const okRes = await request(app)
      .put('/profile/languages')
      .set('Authorization', `Bearer ${token}`)
      .send({ native_language_id: 1, learning_language_id: 2, interface_language_id: 1 });

    expect(okRes.status).toBe(200);
    expect(userModel.updateUserLanguages).toHaveBeenCalled();

    const badRes = await request(app)
      .put('/profile/languages')
      .set('Authorization', `Bearer ${token}`)
      .send({ native_language_id: 1, learning_language_id: 1, interface_language_id: 1 });

    expect(badRes.status).toBe(400);
  });

  test('rejects invalid token', async () => {
    const res = await request(app).get('/profile').set('Authorization', 'Bearer malformed');
    expect(res.status).toBe(401);
  });
});
