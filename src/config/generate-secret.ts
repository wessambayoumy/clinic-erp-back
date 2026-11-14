import { randomBytes } from 'crypto';

/** Generates a cryptographically random hex secret for configuration values. */
export const generateSecret = (): string => randomBytes(64).toString('hex');
