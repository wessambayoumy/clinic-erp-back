/**
 * Standard envelope wrapped around every successful API response.
 */
export interface IApiResponse<T> {
  /** Always `true` for responses produced by the response interceptor. */
  success: boolean;
  /** The payload returned by the route handler. */
  data: T;
}