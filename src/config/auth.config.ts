import { registerAs } from '@nestjs/config';

const isProduction = process.env.NODE_ENV === 'production';

export default registerAs('auth', () => ({
  jwt: {
    accessSecret:
      process.env.JWT_ACCESS_SECRET ??
      (isProduction
        ? undefined
        : 'local-development-access-secret-change-me-32'),
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
    refreshSecret:
      process.env.JWT_REFRESH_SECRET ??
      (isProduction
        ? undefined
        : 'local-development-refresh-secret-change-me-32'),
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
    issuer: process.env.JWT_ISSUER,
    audience: process.env.JWT_AUDIENCE,
  },
}));
