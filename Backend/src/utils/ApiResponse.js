class ApiResponse {
  constructor(statusCode, data = null, message = "Success") {
    this.status = statusCode;
    this.message = message;
    this.data = data;
    this.success = statusCode < 400;
  }
}

export { ApiResponse };
