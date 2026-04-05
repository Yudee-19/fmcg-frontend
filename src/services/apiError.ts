export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export class ApiError extends Error {
  code: string;
  statusCode: number;

  constructor(code: string, message: string, statusCode: number = 0) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.statusCode = statusCode;
  }
}
