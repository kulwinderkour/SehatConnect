/**
 * Request Validation Middleware
 * Validates request body, query, and params against schemas
 */

const validateRequest = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false, // Return all errors
      stripUnknown: true, // Remove unknown fields
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors,
      });
    }

    // Replace request data with validated data
    req[property] = value;
    next();
  };
};

/**
 * Common validation rules
 */
const commonValidations = {
  // MongoDB ObjectId validation
  isObjectId: (value, helpers) => {
    if (!/^[0-9a-fA-F]{24}$/.test(value)) {
      return helpers.error('any.invalid');
    }
    return value;
  },

  // Phone number validation (Indian format)
  isPhone: (value, helpers) => {
    if (!/^[6-9]\d{9}$/.test(value.replace(/[\s-]/g, ''))) {
      return helpers.error('any.invalid');
    }
    return value;
  },

  // Date in future
  isFutureDate: (value, helpers) => {
    if (new Date(value) <= new Date()) {
      return helpers.error('any.invalid');
    }
    return value;
  },

  // Date in past
  isPastDate: (value, helpers) => {
    if (new Date(value) >= new Date()) {
      return helpers.error('any.invalid');
    }
    return value;
  },
};

module.exports = { validateRequest, commonValidations };
