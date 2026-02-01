import { ApiError } from "../utils/ApiError.js";
import { env } from "../config/env.js";

export const errorHandler = (err, req, res, next) => {
  let error = err;

  // Wrap non-standard errors into ApiError
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || error.status || 500;
    const message = error.message || "Internal Server Error";
    error = new ApiError(statusCode, message, error.errors || [], err.stack);
  }

  const response = {
    success: false,
    message: error.message,
    errors: error.errors,
    ...(env.nodeEnv === "development" ? { stack: error.stack } : {}),
  };

  if (req.log) {
    req.log.error({ err: error }, error.message);
  }

  return res.status(error.statusCode).json(response);
};
