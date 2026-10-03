export type ApiErrorResponse = {
  error: string;
  code?: string;
  details?: Record<string, string[]>;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public details?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "ApiError";
  }
}
