const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isValidEmail = (email = '') => EMAIL_REGEX.test(email);

const isPositiveInt = (value) => Number.isInteger(Number(value)) && Number(value) > 0;

const isValidMediaType = (type) => ['image', 'gif'].includes(type);

const isValidConceptType = (type) => ['word', 'phrase'].includes(type);

module.exports = {
  isValidEmail,
  isPositiveInt,
  isValidMediaType,
  isValidConceptType
};
