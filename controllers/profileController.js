const { success, error } = require('../utils/response');
const { isPositiveInt } = require('../utils/validators');
const userModel = require('../models/userModel');
const languageModel = require('../models/languageModel');

const getProfile = async (req, res, next) => {
  try {
    const profile = await userModel.getUserProfileById(req.user.user_id);
    if (!profile) {
      return error(res, 'User not found', 404);
    }

    return success(res, {
      email: profile.email,
      native_language: profile.native_language_id
        ? {
            id: profile.native_language_id,
            code: profile.native_language_code,
            name: profile.native_language_name
          }
        : null,
      learning_language: profile.learning_language_id
        ? {
            id: profile.learning_language_id,
            code: profile.learning_language_code,
            name: profile.learning_language_name
          }
        : null,
      interface_language: profile.interface_language_id
        ? {
            id: profile.interface_language_id,
            code: profile.interface_language_code,
            name: profile.interface_language_name
          }
        : null
    });
  } catch (err) {
    return next(err);
  }
};

const updateLanguages = async (req, res, next) => {
  try {
    const { native_language_id, learning_language_id, interface_language_id } = req.body;

    if (![native_language_id, learning_language_id, interface_language_id].every(isPositiveInt)) {
      return error(res, 'Language IDs must be positive integers', 400);
    }

    if (Number(native_language_id) === Number(learning_language_id)) {
      return error(res, 'native_language_id must differ from learning_language_id', 400);
    }

    const [nativeLanguage, learningLanguage, interfaceLanguage] = await Promise.all([
      languageModel.getLanguageById(native_language_id),
      languageModel.getLanguageById(learning_language_id),
      languageModel.getLanguageById(interface_language_id)
    ]);

    if (!nativeLanguage || !learningLanguage || !interfaceLanguage) {
      return error(res, 'One or more language IDs are invalid', 400);
    }

    await userModel.updateUserLanguages({
      userId: req.user.user_id,
      nativeLanguageId: native_language_id,
      learningLanguageId: learning_language_id,
      interfaceLanguageId: interface_language_id
    });

    return success(res, {
      native_language: nativeLanguage,
      learning_language: learningLanguage,
      interface_language: interfaceLanguage
    });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  getProfile,
  updateLanguages
};
