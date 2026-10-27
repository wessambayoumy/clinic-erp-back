import { Injectable, StreamableFile } from '@nestjs/common';
import type {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
} from '@nestjs/common';
import { map } from 'rxjs';
import type { Observable } from 'rxjs';

import type { IApiResponse } from '@shared/interfaces';




/**
 * Wraps every successful response in `{ success: true, data }`.
 * Streamed files are passed through untouched so downloads keep working.
 * Errors are not handled here, use a global exception filter for those.
 */
@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, IApiResponse<T> | StreamableFile>
{
  /**
   * Maps the handler result into the standard response envelope.
   *
   * @param _context - Execution context (unused).
   * @param next - Call handler producing the route result.
   * @returns Observable emitting the wrapped response.
   */
  public intercept(
    _context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<IApiResponse<T> | StreamableFile> {
    return next.handle().pipe(
      map((data: T): IApiResponse<T> | StreamableFile =>
        data instanceof StreamableFile ? data : { success: true, data },
      ),
    );
  }
}