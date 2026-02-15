const { success, error } = require('../utils/response');
const { isPositiveInt, isValidMediaType, isValidConceptType } = require('../utils/validators');
const conceptModel = require('../models/conceptModel');
const translationModel = require('../models/translationModel');
const mediaModel = require('../models/mediaModel');
const languageModel = require('../models/languageModel');

const createConcept = async (req, res, next) => {
  try {
    const { type, difficulty_level } = req.body;

    if (!isValidConceptType(type)) {
      return error(res, 'Invalid concept type', 400);
    }

    const concept = await conceptModel.createConcept({ type, difficultyLevel: difficulty_level || null });
    return success(res, concept, 201);
  } catch (err) {
    return next(err);
  }
};

const addTranslation = async (req, res, next) => {
  try {
    const { concept_id, language_id, text } = req.body;

    if (!isPositiveInt(concept_id) || !isPositiveInt(language_id) || !text) {
      return error(res, 'concept_id, language_id and text are required', 400);
    }

    const language = await languageModel.getLanguageById(language_id);
    if (!language) {
      return error(res, 'Invalid language_id', 400);
    }

    const translation = await translationModel.addTranslation({
      conceptId: concept_id,
      languageId: language_id,
      text
    });

    return success(res, translation, 201);
  } catch (err) {
    return next(err);
  }
};

const uploadMedia = async (req, res, next) => {
  try {
    const { concept_id, type, file_url } = req.body;

    if (!isPositiveInt(concept_id) || !file_url || !isValidMediaType(type)) {
      return error(res, 'concept_id, valid type and file_url are required', 400);
    }

    const media = await mediaModel.addMedia({
      conceptId: concept_id,
      type,
      fileUrl: file_url
    });

    return success(res, media, 201);
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  createConcept,
  addTranslation,
  uploadMedia
};
