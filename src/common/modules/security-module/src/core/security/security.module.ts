import { Module } from '@nestjs/common';

import { EncryptionService, HashService } from './services';

/**
 * Shared module for crypto-related utility services.
 * Import it into any feature module that needs hashing or field encryption.
 * Requires `ConfigModule` to be registered at the application root.
 */
@Module({
  providers: [HashService, EncryptionService],
  exports: [HashService, EncryptionService],
})
export class SecurityModule {}
