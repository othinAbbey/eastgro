import Joi from 'joi';

const validateEmail = (email) => {
  const schema = Joi.string()
    .email({ minDomainSegments: 2 })
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'string.empty': 'Email is required'
    });

  return schema.validate(email);
};

const isValidPhone = (phone) => {
  const regex = /^\+?\d{9,15}$/;
  return regex.test(phone);
};

const isValidName = (name) => {
  return typeof name === 'string' && name.trim().length >= 2;
};

const isValidNumber = (value) => {
  return typeof value === 'number' && !isNaN(value);
};

const isEmpty = (value) => {
  return (
    value === null ||
    value === undefined ||
    (typeof value === 'string' && value.trim() === '') ||
    (Array.isArray(value) && value.length === 0) ||
    (typeof value === 'object' && Object.keys(value).length === 0)
  );
};

const isValidDate = (dateStr) => {
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
};

const isWeatherDataValid = (data) => {
  return (
    data !== null &&
    typeof data === 'object' &&
    data.hasOwnProperty('temperature') &&
    data.hasOwnProperty('condition') &&
    data.hasOwnProperty('humidity') &&
    isValidNumber(data.temperature) &&
    typeof data.condition === 'string' &&
    isValidNumber(data.humidity)
  );
};

// const validateLocation = (data) => {
//   const { location } = data;
//   if (!location || typeof location !== 'string' || location.trim().length === 0) {
//     return { error: { details: [{ message: 'Location is required and must be a non-empty string.' }] } };
//   }
//   return { value: data };
// };
const validateLocation = (input) => {
  const schema = Joi.object({
    location: Joi.string().min(2).max(100).required()
      .messages({
        'string.empty': 'Location is required',
        'string.min': 'Location must be at least 2 characters',
        'string.max': 'Location cannot exceed 100 characters'
      })
  });

  return schema.validate(input);
};

const validateSubscription = (data) => {
  const { phone, location } = data;
  if (!phone || !isValidPhone(phone)) {
    return { error: { details: [{ message: 'Invalid phone number.' }] } };
  }
  if (!location || typeof location !== 'string' || location.trim().length === 0) {
    return { error: { details: [{ message: 'Location is required and must be a non-empty string.' }] } };
  }
  return { value: data };
};

const validateWeatherData = (data) => {
  const { temperature, condition, humidity } = data;
  if (!isValidNumber(temperature)) {
    return { error: { details: [{ message: 'Temperature must be a valid number.' }] } };
  }
  if (typeof condition !== 'string' || condition.trim().length === 0) {
    return { error: { details: [{ message: 'Condition must be a non-empty string.' }] } };
  }
  if (!isValidNumber(humidity)) {
    return { error: { details: [{ message: 'Humidity must be a valid number.' }] } };
  }
  return { value: data };
};

const validateFarmerData = (data) => {
  const { name, email, phone } = data;
  if (!isValidName(name)) {
    return { error: { details: [{ message: 'Name must be at least 2 characters long.' }] } };
  }
  const emailValidation = validateEmail(email);
  if (emailValidation.error) {
    return { error: { details: [{ message: 'Invalid email format.' }] } };
  }
  if (!isValidPhone(phone)) {
    return { error: { details: [{ message: 'Invalid phone number.' }] } };
  }
  return { value: data };
};

const validateResourceData = (data) => {
  const { title, description, url } = data;
  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return { error: { details: [{ message: 'Title is required and must be a non-empty string.' }] } };
  }
  if (!description || typeof description !== 'string' || description.trim().length === 0) {
    return { error: { details: [{ message: 'Description is required and must be a non-empty string.' }] } };
  }
  if (!url || typeof url !== 'string' || !/^https?:\/\/.+/.test(url)) {
    return { error: { details: [{ message: 'URL must be a valid HTTP or HTTPS URL.' }] } };
  }
  return { value: data };
};

const validateWeatherSubscription = (data) => {
  const { phone, location } = data;
  if (!isValidPhone(phone)) {
    return { error: { details: [{ message: 'Invalid phone number.' }] } };
  }
  if (!location || typeof location !== 'string' || location.trim().length === 0) {
    return { error: { details: [{ message: 'Location is required and must be a non-empty string.' }] } };
  }
  return { value: data };
};

export {
  validateEmail,
  isValidPhone,
  isValidName,
  isValidNumber,
  isEmpty,
  isValidDate,
  isWeatherDataValid,
  validateLocation,
  validateSubscription,
  validateWeatherData,
  validateFarmerData,
  validateResourceData,
  validateWeatherSubscription
};
