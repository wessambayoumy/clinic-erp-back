import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  db_url: process.env.DATABASE_URL,
}));
