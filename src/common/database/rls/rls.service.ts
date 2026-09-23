import { Injectable } from '@nestjs/common';
import type { RLSContext } from './rls.context';
import { LoggerService } from '@common/observability/logging/logger.service';
import { PrismaTransaction } from '../transaction/transaction.service';
import { PrismaService } from '@core/database/prisma/prisma.service';

@Injectable()
export class RLSService {
  constructor(private readonly logger: LoggerService, private readonly prisma: PrismaService) {}

  /**
   * Apply RLS context on the given transaction's own connection via
   * `set_config(..., true)`. The `true` third argument makes each setting
   * transaction-local — it resets automatically on commit or rollback, so
   * there is no separate "clear" step, and there shouldn't be one: a
   * manual clear on a pooled connection has the exact same wrong-connection
   * problem that made the old `setContext()` a no-op in practice.
   *
   * Must be called with the same `tx` handle every later query in that
   * transaction uses. Calling this against the top-level Prisma client
   * instead of `tx` — which is what the previous implementation would have
   * had to do, since it never received a transaction handle at all — sets
   * the variable on whatever pooled connection happens to be free at that
   * moment, not necessarily the one the transaction later runs on, and
   * silently defeats RLS.
   *
   * The key names below (`app.organization_id` etc.) must match exactly
   * what `rls-policies.sql`'s `current_setting(...)` calls read — verify
   * against that file before relying on this in production.
   *
   * @throws whatever the underlying query throws — deliberately not caught
   * here. Swallowing a failed `set_config` would silently return to
   * unscoped queries, which is worse than failing the request.
   */
  public async applyContext(tx: PrismaTransaction, context: RLSContext): Promise<void> {
    // `tx` has no `.raw` — that namespace only exists on the top-level client.
    // Building the plan here doesn't touch a connection at all (it just
    // assembles SQL text, params, and the row spec); `tx.query(plan)` below
    // is what actually executes it, and that's what runs it on this
    // transaction's own connection — which is the part that matters for RLS.
    const plan = this.prisma.client.raw.sql`
      SELECT
        set_config('app.organization_id', ${context.organizationId}, true) AS org,
        set_config('app.location_id', ${context.locationId ?? ''}, true) AS loc,
        set_config('app.user_id', ${context.userId ?? ''}, true) AS usr
    `
      .returnsRow({ org: 'pg/text@1', loc: 'pg/text@1', usr: 'pg/text@1' })
      .build();
 
    await tx.query(plan);
 
    this.logger.debug(
      `RLS context applied: org=${context.organizationId}, ` +
        `location=${context.locationId ?? 'none'}, user=${context.userId ?? 'none'}`,
    );
  }
}