const request = require('supertest');
const createTestApp = require('../utils/createTestApp');

jest.mock('../../models/languageModel', () => ({
  getLanguageByCode: jest.fn()
}));

jest.mock('../../models/localizationModel', () => ({
  getLocalizationWithFallback: jest.fn()
}));

const languageModel = require('../../models/languageModel');
const localizationModel = require('../../models/localizationModel');

describe('Localization API', () => {
  const app = createTestApp();

  beforeEach(() => jest.clearAllMocks());

  test('loads translations and falls back to english keys', async () => {
    languageModel.getLanguageByCode
      .mockResolvedValueOnce({ id: 2, code: 'es' })
      .mockResolvedValueOnce({ id: 1, code: 'en' });

    localizationModel.getLocalizationWithFallback.mockResolvedValue([
      { key: 'welcome', text: 'Bienvenido' },
      { key: 'logout', text: 'Logout' }
    ]);

    const res = await request(app).get('/localization?lang=es');

    expect(res.status).toBe(200);
    expect(res.body.data.welcome).toBe('Bienvenido');
    expect(res.body.data.logout).toBe('Logout');
  });

  test('handles unsupported language', async () => {
    languageModel.getLanguageByCode
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: 1, code: 'en' });

    const res = await request(app).get('/localization?lang=zz');
    expect(res.status).toBe(400);
  });
});
