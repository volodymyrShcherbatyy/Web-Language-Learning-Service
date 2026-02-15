const { success, error } = require('../utils/response');
const { isPositiveInt } = require('../utils/validators');
const conceptModel = require('../models/conceptModel');

const getAllConcepts = async (req, res, next) => {
  try {
    const concepts = await conceptModel.getAllConcepts();
    return success(res, concepts);
  } catch (err) {
    return next(err);
  }
};

const getConceptById = async (req, res, next) => {
  try {
    const conceptId = req.params.id;
    if (!isPositiveInt(conceptId)) {
      return error(res, 'Invalid concept ID', 400);
    }

    const concept = await conceptModel.getConceptById(conceptId);
    if (!concept) {
      return error(res, 'Concept not found', 404);
    }

    return success(res, concept);
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  getAllConcepts,
  getConceptById
};
