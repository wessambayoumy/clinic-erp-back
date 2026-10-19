/**
 * Options for building a namespaced S3 object key.
 */
export interface IS3SetKeyOptions {
  /** Logical folder path inside the app namespace (e.g. `users/avatars`). */
  path: string;
  /** Client-supplied file name; sanitized before use. */
  originalname: string;
}
