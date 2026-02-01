import { ApiError } from "../utils/ApiError.js";

export const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (error) {
    // If it's a ZodError, extracting meaningful messages
    if (error.errors) {
      const errorMessages = error.errors.map(
        (err) => `${err.path.join(".")}: ${err.message}`,
      );
      return next(new ApiError(400, "Validation Error", errorMessages));
    }
    return next(new ApiError(400, "Invalid Request", [error.message]));
  }
};
