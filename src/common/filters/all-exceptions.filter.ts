import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

import { ExceptionCodeEnum } from '../../shared/enums/http/exception-code.enum';

/** Sends consistent HTTP error responses and hides unexpected internal details. */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  /** Creates the filter with the HTTP adapter selected by Nest. */
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  /** Converts an application exception into the shared API error shape. */
  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const context = host.switchToHttp();
    const isHttpException = exception instanceof HttpException;
    const statusCode = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;
    const code = this.getExceptionCode(statusCode);
    const message = isHttpException
      ? this.getHttpExceptionMessage(exception)
      : 'Internal server error';

    this.logException(exception);

    httpAdapter.reply(
      context.getResponse(),
      {
        statusCode,
        code,
        timestamp: new Date().toISOString(),
        path: httpAdapter.getRequestUrl(context.getRequest()),
        message,
      },
      statusCode,
    );
  }

  /** Gets the public message from the standard Nest HTTP exception response. */
  private getHttpExceptionMessage(exception: HttpException): string | string[] {
    const response = exception.getResponse();

    if (typeof response === 'string') {
      return response;
    }

    if (typeof response === 'object' && response !== null && 'message' in response) {
      const { message } = response;

      if (typeof message === 'string' || Array.isArray(message)) {
        return message;
      }
    }

    return exception.message;
  }

  /** Maps known Nest HTTP statuses to a stable code, using 500 as fallback. */
  private getExceptionCode(statusCode: number): ExceptionCodeEnum {
    const statusName = HttpStatus[statusCode];
    const enumCodes: readonly string[] = Object.values(ExceptionCodeEnum);

    return enumCodes.includes(statusName)
      ? (statusName as ExceptionCodeEnum)
      : ExceptionCodeEnum.INTERNAL_SERVER_ERROR;
  }

  /** Writes full exception details to the server logger. */
  private logException(exception: unknown): void {
    if (exception instanceof Error) {
      this.logger.error(exception.message, exception.stack);
      return;
    }

    this.logger.error('An unknown value was thrown by the application');
  }
}
