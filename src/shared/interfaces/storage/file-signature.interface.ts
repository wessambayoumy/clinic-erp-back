/**
 * A run of magic bytes expected at a fixed offset from the start of a file.
 */
export interface IFileSignature {
  /** Byte offset from the start of the file. */
  readonly offset: number;
  /** Expected byte values at that offset. */
  readonly bytes: readonly number[];
}
