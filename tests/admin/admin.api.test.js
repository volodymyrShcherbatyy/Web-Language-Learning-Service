const request = require('supertest');
const createTestApp = require('../utils/createTestApp');
const { makeToken } = require('../utils/token');

jest.mock('../../models/conceptModel', () => ({ createConcept: jest.fn() }));
jest.mock('../../models/translationModel', () => ({ addTranslation: jest.fn() }));
jest.mock('../../models/mediaModel', () => ({ addMedia: jest.fn() }));
jest.mock('../../models/languageModel', () => ({ getLanguageById: jest.fn() }));

const conceptModel = require('../../models/conceptModel');
const translationModel = require('../../models/translationModel');
const mediaModel = require('../../models/mediaModel');
const languageModel = require('../../models/languageModel');

describe('Admin and role authorization', () => {
  const app = createTestApp();
  const userToken = makeToken({ user_id: 1, role: 'user' }, 'change-me-in-production');
  const adminToken = makeToken({ user_id: 2, role: 'admin' }, 'change-me-in-production');

  beforeEach(() => jest.clearAllMocks());

  test('prevents regular user from admin routes', async () => {
    const res = await request(app).post('/admin/concepts').set('Authorization', `Bearer ${userToken}`).send({ type: 'word' });
    expect(res.status).toBe(403);
  });

  test('allows admin concept/translation/media CRUD endpoints', async () => {
    conceptModel.createConcept.mockResolvedValue({ id: 30, type: 'word' });
    languageModel.getLanguageById.mockResolvedValue({ id: 1, code: 'en' });
    translationModel.addTranslation.mockResolvedValue({ id: 2 });
    mediaModel.addMedia.mockResolvedValue({ id: 3 });

    const conceptRes = await request(app)
      .post('/admin/concepts')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ type: 'word', difficulty_level: 1 });
    expect(conceptRes.status).toBe(201);

    const trRes = await request(app)
      .post('/admin/translations')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ concept_id: 30, language_id: 1, text: 'hello' });
    expect(trRes.status).toBe(201);

    const mediaRes = await request(app)
      .post('/admin/media')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ concept_id: 30, type: 'image', file_url: 'https://cdn/x.png' });
    expect(mediaRes.status).toBe(201);
  });
});
