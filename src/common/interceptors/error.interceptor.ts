import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import type {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
} from '@nestjs/common';
import { catchError, throwError } from 'rxjs';
import type { Observable } from 'rxjs';

import type { IApiErrorResponse } from '@shared/interfaces';

/**
 * Normalizes every error thrown inside a route into
 * `{ success: false, statusCode, message, error }`.
 * Unknown errors are logged in full server-side and returned as a sanitized 500.
 * Note: errors thrown by guards run before interceptors and are not caught here.
 */
@Injectable()
export class ErrorInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ErrorInterceptor.name);

  /**
   * Catches errors from the handler and rethrows them as standardized HttpExceptions.
   *
   * @param _context - Execution context (unused).
   * @param next - Call handler producing the route result.
   * @returns Observable that errors with the normalized exception.
   */
  public intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    return next
      .handle()
      .pipe(
        catchError((error: unknown) =>
          throwError(() => this.toHttpException(error)),
        ),
      );
  }

  /**
   * Converts any thrown value into an HttpException carrying the error envelope.
   *
   * @param error - The thrown value.
   * @returns HttpException with a standardized body.
   */
  private toHttpException(error: unknown): HttpException {
    if (error instanceof HttpException) {
      const status = error.getStatus();
      if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
        this.logger.error(error.message, error.stack);
      }
      return new HttpException(
        this.buildBody(status, this.extractMessage(error), error.name),
        status,
      );
    }

    this.logger.error(
      error instanceof Error ? error.message : 'Unknown error',
      error instanceof Error ? error.stack : undefined,
    );
    const fallback = new InternalServerErrorException();
    return new HttpException(
      this.buildBody(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Internal server error',
        fallback.name,
      ),
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  /**
   * Pulls the message (or validation message list) out of an HttpException.
   *
   * @param exception - The exception to read.
   * @returns The message string or array of messages.
   */
  private extractMessage(exception: HttpException): string | string[] {
    const response = exception.getResponse();
    if (typeof response === 'string') {
      return response;
    }
    const { message } = response as { message?: string | string[] };
    return message ?? exception.message;
  }

  /**
   * Builds the standard error body.
   *
   * @param statusCode - HTTP status code.
   * @param message - Message or list of messages.
   * @param error - Exception name.
   * @returns The error envelope.
   */
  private buildBody(
    statusCode: number,
    message: string | string[],
    error: string,
  ): IApiErrorResponse {
    return { success: false, statusCode, message, error };
  }
}
