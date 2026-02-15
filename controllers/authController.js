const { isValidEmail } = require('../utils/validators');
const { success, error } = require('../utils/response');
const userModel = require('../models/userModel');
const { hashPassword, comparePassword, signToken } = require('../services/authService');

const register = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return error(res, 'Email and password are required', 400);
    }

    if (!isValidEmail(email)) {
      return error(res, 'Invalid email format', 400);
    }

    const existing = await userModel.getUserByEmail(email);
    if (existing) {
      return error(res, 'Email already in use', 409);
    }

    const passwordHash = await hashPassword(password);
    const user = await userModel.createUser({ email, passwordHash, role: 'user' });
    const token = signToken({ id: user.id, role: user.role });

    return success(res, { token }, 201);
  } catch (err) {
    return next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return error(res, 'Email and password are required', 400);
    }

    const user = await userModel.getUserByEmail(email);
    if (!user || !user.is_active) {
      process.stderr.write(`[AUTH_FAILURE] Invalid login for ${email || 'unknown-email'} from ${req.ip}\n`);
      return error(res, 'Invalid credentials', 401);
    }

    const matches = await comparePassword(password, user.password_hash);
    if (!matches) {
      process.stderr.write(`[AUTH_FAILURE] Invalid login for ${email || 'unknown-email'} from ${req.ip}\n`);
      return error(res, 'Invalid credentials', 401);
    }

    const token = signToken({ id: user.id, role: user.role });
    const profile = await userModel.getUserProfileById(user.id);

    return success(res, {
      token,
      profile: {
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
      }
    });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  register,
  login
};
