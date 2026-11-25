import { Module } from '@nestjs/common';

import { EncryptionService } from './encryption.service';
import { HashService } from './hash.service';

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
