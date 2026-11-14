import { PartialType } from '@nestjs/mapped-types';

import { CreateHistoryEntryDto } from './create-history-entry.dto';

/**
 * Body for PATCH .../histories/:historyId.
 */
export class UpdateHistoryEntryDto extends PartialType(CreateHistoryEntryDto) {}
