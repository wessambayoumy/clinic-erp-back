import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'node:async_hooks';
import type { RequestContext } from './../interfaces/request-context.interface';

/**
 * Thin wrapper around Node's `AsyncLocalStorage`, scoped to one
 * `RequestContext` per in-flight request. `RequestContextInterceptor` seeds
 * it once per request via `run()`; everything downstream — services,
 * `TransactionService`, `RLSService` — reads it back via `getContext()`
 * without it being threaded through every method signature.
 */
@Injectable()
export class RequestContextStorage {
  private readonly storage: AsyncLocalStorage<RequestContext> =
    new AsyncLocalStorage();

  /**
   * Runs `callback` with `context` available to `getContext()` for the
   * entire async duration of that callback (including anything it awaits,
   * schedules, or subscribes to) — not just its synchronous body.
   */
  public run<T>(context: RequestContext, callback: () => T): T {
    return this.storage.run(context, callback);
  }

  /**
   * Returns the context for whichever request is currently in scope, or
   * `undefined` if called outside any request (e.g. app bootstrap, a
   * scheduled job with no interceptor in its path).
   */
  public getContext(): RequestContext | undefined {
    return this.storage.getStore();
  }
}
