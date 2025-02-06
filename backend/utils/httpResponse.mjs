class httpError {
  constructor(message, statusCode) {
    this.statusCode = statusCode;
    this.message = message;
  }
}
class httpResponse {
  constructor(message, statusCode) {
    this.statusCode = statusCode;
    this.message = message;
  }
}
export { httpError, httpResponse };
