const { success, error } = require('../utils/response');
const languageModel = require('../models/languageModel');
const localizationModel = require('../models/localizationModel');

const getLocalization = async (req, res, next) => {
  try {
    const lang = (req.query.lang || '').toLowerCase();
    if (!lang) {
      return error(res, 'lang query parameter is required', 400);
    }

    const [requestedLanguage, fallbackLanguage] = await Promise.all([
      languageModel.getLanguageByCode(lang),
      languageModel.getLanguageByCode('en')
    ]);

    if (!requestedLanguage) {
      return error(res, 'Unsupported language code', 400);
    }

    if (!fallbackLanguage) {
      return error(res, 'English fallback language is not configured', 500);
    }

    const rows = await localizationModel.getLocalizationWithFallback(
      requestedLanguage.id,
      fallbackLanguage.id
    );

    const dictionary = rows.reduce((acc, row) => {
      acc[row.key] = row.text;
      return acc;
    }, {});

    return success(res, dictionary);
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  getLocalization
};
