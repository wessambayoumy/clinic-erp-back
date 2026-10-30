import { AllowedMimeTypeEnum } from '../../enums/storage';

import type { IFileSignature } from '../../../shared/interfaces/storage';

/**
 * Magic bytes per MIME type.
 * Outer array = alternatives (any may match); inner array = segments (all must match).
 */
export const FILE_SIGNATURES: ReadonlyMap<
  AllowedMimeTypeEnum,
  readonly (readonly IFileSignature[])[]
> = new Map([
  [AllowedMimeTypeEnum.PDF, [[{ offset: 0, bytes: [0x25, 0x50, 0x44, 0x46] }]]],
  [AllowedMimeTypeEnum.JPEG, [[{ offset: 0, bytes: [0xff, 0xd8, 0xff] }]]],
  [
    AllowedMimeTypeEnum.PNG,
    [[{ offset: 0, bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] }]],
  ],
  [
    AllowedMimeTypeEnum.WEBP,
    [
      [
        { offset: 0, bytes: [0x52, 0x49, 0x46, 0x46] },
        { offset: 8, bytes: [0x57, 0x45, 0x42, 0x50] },
      ],
    ],
  ],
  [
    AllowedMimeTypeEnum.TIFF,
    [
      [{ offset: 0, bytes: [0x49, 0x49, 0x2a, 0x00] }],
      [{ offset: 0, bytes: [0x4d, 0x4d, 0x00, 0x2a] }],
    ],
  ],
  // DICOM Part 10: 128-byte preamble followed by "DICM".
  [
    AllowedMimeTypeEnum.DICOM,
    [[{ offset: 128, bytes: [0x44, 0x49, 0x43, 0x4d] }]],
  ],
]);

/** File extension used in generated object keys. */
export const MIME_EXTENSIONS: ReadonlyMap<AllowedMimeTypeEnum, string> =
  new Map([
    [AllowedMimeTypeEnum.PDF, 'pdf'],
    [AllowedMimeTypeEnum.JPEG, 'jpg'],
    [AllowedMimeTypeEnum.PNG, 'png'],
    [AllowedMimeTypeEnum.WEBP, 'webp'],
    [AllowedMimeTypeEnum.TIFF, 'tif'],
    [AllowedMimeTypeEnum.DICOM, 'dcm'],
  ]);

/** Number of leading bytes needed to verify any signature above. */
export const SIGNATURE_HEADER_BYTES: number = Math.max(
  ...[...FILE_SIGNATURES.values()].flatMap((alternatives) =>
    alternatives.flatMap((segments) =>
      segments.map((segment) => segment.offset + segment.bytes.length),
    ),
  ),
);
