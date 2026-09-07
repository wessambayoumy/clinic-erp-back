import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  db_url: process.env.DATABASE_URL,
}));


// npg_pGvl2zHStX9M