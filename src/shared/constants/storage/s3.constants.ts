/** DI token for the shared `S3Client` instance. */
export const S3_CLIENT: unique symbol = Symbol('S3_CLIENT');

/** Multipart part size. S3 requires at least 5 MiB per part (except the last). */
export const S3_PART_SIZE_BYTES = 5 * 1024 * 1024;

/** Number of parts uploaded concurrently per file. Memory use is roughly queue size x part size. */
export const S3_UPLOAD_QUEUE_SIZE = 4;

/** Default per-file size ceiling when `S3_MAX_UPLOAD_BYTES` is not set (20 MiB). */
export const S3_DEFAULT_MAX_UPLOAD_BYTES = 20 * 1024 * 1024;

/** Content type reported when S3 returns none. */
export const S3_FALLBACK_MIME_TYPE = 'application/octet-stream';

/** Object metadata key holding the base64url-encoded original filename. */
export const S3_ORIGINAL_FILENAME_METADATA_KEY = 'original-filename';

/** Maximum characters of the original filename kept in metadata (S3 caps user metadata at 2 KB). */
export const S3_MAX_FILENAME_LENGTH = 120;
