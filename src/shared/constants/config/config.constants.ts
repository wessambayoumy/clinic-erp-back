import { ConfigEnum } from '@/shared/enums/config';

export const ConfigConsts = {
  app: {
    development: `${ConfigEnum.app}.nodeEnv`,
    port: `${ConfigEnum.app}.port`,
    apiPrefix: `${ConfigEnum.app}.apiPrefix`,
    corsOrigin: `${ConfigEnum.app}.corsOrigin`,
  },
  auth: {
    jwtSecret: `${ConfigEnum.auth}.jwt.accessSecret`,
    jwtExpirationTime: `${ConfigEnum.auth}.jwt.accessExpiresIn`,
    jwtRefreshSecret: `${ConfigEnum.auth}.jwt.refreshSecret`,
    jwtRefreshExpirationTime: `${ConfigEnum.auth}.jwt.refreshExpiresIn`,
  },
  bullmq: {
    connectionString: `${ConfigEnum.bullmq}.connectionString`,
    queueName: `${ConfigEnum.bullmq}.queueName`,
    queueOptions: `${ConfigEnum.bullmq}.queueOptions`,
  },
  database: {
    url: `${ConfigEnum.database}.url`,
  },
  email: {
    from: `${ConfigEnum.email}.from`,
    transport: `${ConfigEnum.email}.transport`,
    smtpUrl: `${ConfigEnum.email}.smtpUrl`,
    otpHashSecret: `${ConfigEnum.email}.otpHashSecret`,
    codeMaxAttempts: `${ConfigEnum.email}.codeMaxAttempts`,
    requestLimitPerHour: `${ConfigEnum.email}.requestLimitPerHour`,
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
