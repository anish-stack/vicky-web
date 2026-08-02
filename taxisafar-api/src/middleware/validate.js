const ApiError = require("../utils/apiError");

/** Joi validator. `where` is one of body | query | params. */
const validate = (schema, where = "body") => (req, res, next) => {
  const { error, value } = schema.validate(req[where], {
    abortEarly: false,
    stripUnknown: true,
    convert: true,
  });
  if (error) {
    const details = error.details.map((d) => d.message);
    return next(ApiError.badRequest(details.join(", "), details));
  }
  req[where] = value;
  next();
};

module.exports = validate;
