import { registerAs } from '@nestjs/config';
import { ConfigEnum } from './config.enum';

export default registerAs(ConfigEnum.redis, () => ({
  url: process.env.REDIS_URL,
}));
