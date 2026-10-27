/**
 * Standard envelope returned for every failed API request.
 */
export interface IApiErrorResponse {
  /** Always `false` for error responses. */
  success: boolean;
  /** HTTP status code of the failure. */
  statusCode: number;
  /** Human-readable message, or a list of validation messages. */
  message: string | string[];
  /** Name of the exception that produced the error. */
  error: string;
}