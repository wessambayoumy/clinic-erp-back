import { randomBytes } from 'crypto';

export const generateSecret = () => randomBytes(64).toString('hex');
