class AppError extends Error {
  constructor(message, statusCode) {
    super(message); //passing error message to Error class constructor function
    this.statusCode = statusCode || 500;
    this.status = `${statusCode}`.startsWith("4") ? "Fail" : "Error";
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}
module.exports = AppError;
