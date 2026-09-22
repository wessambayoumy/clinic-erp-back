import { LoggerService } from '@common/observability/logging/logger.service';
import { Injectable } from '@nestjs/common';
import { RLSService } from '@common/database/rls/rls.service';
import { PrismaService } from '@core/database/prisma/prisma.service';
import { db } from '@/prisma/db';
import { RequestContextStorage } from '@common/http/interceptors/request-context.storage';

/**
 * The transaction handle Prisma ORM 8 passes into `db.transaction(callback)`.
 * Prisma exports no name for this type, so it's derived from the client's
 * own `transaction` method signature — the derivation the Prisma docs
 * themselves recommend for this exact situation.
 *
 * Lives here (not in common/repositories) so both BaseRepository and
 * TransactionService can import it without creating a repositories ↔
 * transaction import cycle.
 */

export type PrismaTransaction = Parameters<
  Parameters<typeof db.transaction>[0]
>[0];

@Injectable()
export class TransactionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rlsService: RLSService,
    private readonly requestContextStorage: RequestContextStorage,
    private readonly logger: LoggerService,
  ) {}

  /**
   * Run `callback` inside a Prisma ORM 8 transaction with RLS context applied
   * on that transaction's own connection.
   *
   * The tenant context is read from `RequestContextStorage` (AsyncLocalStorage)
   * rather than taken as a parameter — every call site already runs inside a
   * request whose context `RequestContextInterceptor` populated from the
   * verified JWT, so there's nothing for the caller to pass. This also fixes
   * the bug in the original draft: it called `rlsService.setContext()` before
   * opening the transaction, on whatever connection happened to be free at
   * that moment. Under connection pooling that is not necessarily the same
   * connection the transaction itself runs on, so nothing guaranteed RLS was
   * actually enforced for that transaction's queries — consistent with
   * `RLSService.setContext()` being a confirmed no-op. Applying context via
   * `tx` instead, inside the callback, ties it to the exact connection every
   * query in this transaction uses.
   *
   * `set_config(..., true)` — the third argument `RLSService.applyContext()`
   * passes — makes each setting transaction-local, so it resets automatically
   * when the transaction ends, whether by commit or rollback. There is no
   * manual "clear" step, and there shouldn't be one: a `finally`-block clear
   * on a pooled connection has the identical same-connection problem as the
   * original `setContext()` call did.
   *
   * @throws Error if called with no request context in scope. Fails closed —
   * a transaction must never run unscoped rather than silently skip RLS.
   */
  public async run<T>(
    callback: (tx: PrismaTransaction) => Promise<T>,
  ): Promise<T> {
    const context = this.requestContextStorage.getContext();

    if (!context) {
      throw new Error(
        'TransactionService.run() called outside of a request context',
      );
    }

    return this.prisma.client.transaction(async (tx): Promise<T> => {
      await this.rlsService.applyContext(tx, {
        userId: context.userId,
        organizationId: context.organizationId,
        locationId: context.locationId,
      });

      try {
        const result: T = await callback(tx);
        this.logger.debug(
          `Transaction completed for org: ${context.organizationId}`,
        );
        return result;
      } catch (error) {
        const message: string =
          error instanceof Error ? error.message : String(error);
        this.logger.error(`Transaction failed: ${message}`);
        throw error;
      }
    });
  }
}
