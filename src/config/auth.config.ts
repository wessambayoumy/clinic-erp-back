import { registerAs } from '@nestjs/config';
import { generateSecret } from './generate_secret';

export default registerAs('auth', () => {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    jwt: {
      accessSecret:
        process.env.JWT_ACCESS_SECRET ??
        (isProduction ? undefined : generateSecret()),
      accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
      refreshSecret:
        process.env.JWT_REFRESH_SECRET ??
        (isProduction ? undefined : generateSecret()),
      refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '90d',
      issuer: process.env.JWT_ISSUER,
      audience: process.env.JWT_AUDIENCE,
    },
  };
});
