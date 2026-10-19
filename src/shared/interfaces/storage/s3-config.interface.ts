/**
 * Resolved S3 configuration, produced by `s3Config`.
 */
export interface IS3Config {
  readonly region: string;
  readonly bucket: string;
  /** Custom endpoint for S3-compatible stores (MinIO, R2, ...). */
  readonly endpoint?: string;
  readonly forcePathStyle: boolean;
  /** Omit both keys to use the default AWS credential chain (e.g. an EC2 instance role). */
  readonly accessKeyId?: string;
  readonly secretAccessKey?: string;
  /** Default per-file size ceiling in bytes. */
  readonly maxUploadBytes: number;
}
