import { ConfigEnum } from './config.enum';

export const ConfigConsts = {
  app: {
    development: `${ConfigEnum.app}.nodeEnv`,
    port: `${ConfigEnum.app}.port`,
    apiPrefix: `${ConfigEnum.app}.apiPrefix`,
    corsOrigin: `${ConfigEnum.app}.corsOrigin`,
  },
  auth: {
    jwtSecret: `${ConfigEnum.auth}.jwtSecret`,
    jwtExpirationTime: `${ConfigEnum.auth}.jwtExpirationTime`,
    jwtRefreshSecret: `${ConfigEnum.auth}.jwtRefreshSecret`,
    jwtRefreshExpirationTime: `${ConfigEnum.auth}.jwtRefreshExpirationTime`,
  },
  bullmq: {
    connectionString: `${ConfigEnum.bullmq}.connectionString`,
    queueName: `${ConfigEnum.bullmq}.queueName`,
    queueOptions: `${ConfigEnum.bullmq}.queueOptions`,
  },
  database: {
    url: `${ConfigEnum.database}.url`,
  },
  observability: {
    loggingLevel: `${ConfigEnum.observability}.loggingLevel`,
    loggingFormat: `${ConfigEnum.observability}.loggingFormat`,
    loggingColorize: `${ConfigEnum.observability}.loggingColorize`,
    loggingTimestamp: `${ConfigEnum.observability}.loggingTimestamp`,
    loggingMetadata: `${ConfigEnum.observability}.loggingMetadata`,
  },
  redis: {
    url: `${ConfigEnum.redis}.url`,
  },
  s3: {
    region: `${ConfigEnum.s3}.region`,
    bucket: `${ConfigEnum.s3}.bucket`,
    endpoint: `${ConfigEnum.s3}.endpoint`,
    forcePathStyle: `${ConfigEnum.s3}.forcePathStyle`,
    accessKeyId: `${ConfigEnum.s3}.accessKeyId`,
    secretAccessKey: `${ConfigEnum.s3}.secretAccessKey`,
    maxUploadBytes: `${ConfigEnum.s3}.maxUploadBytes`,
  },
};
