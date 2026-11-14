import { registerAs } from '@nestjs/config';
import { ConfigEnum } from '@/shared/enums/config';

export default registerAs(ConfigEnum.redis, () => ({
  url: process.env.REDIS_URL,
}));
