import {
  Injectable,
  Logger,
  LoggerService as NestLoggerService,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/** Fields redacted from log output regardless of nesting depth. */
const SENSITIVE_KEYS = new Set([
  'password',
  'token',
  'accessToken',
  'refreshToken',
  'authorization',
  'ssn',
  'dob',
  'dateOfBirth',
  'mrn',
  'insuranceId',
  'creditCard',
  'cvv',
]);

enum LogLevelEnum {
  INFO = 'info',
  ERROR = 'error',
  WARN = 'warn',
  DEBUG = 'debug',
  VERBOSE = 'verbose',
  FATAL = 'fatal',
}

/** Shape of every structured log line this service emits. */
interface LogEntry {
  timestamp: string;
  level: LogLevelEnum;
  message: string;
  context?: string;
  trace?: string;
  meta?: Record<string, unknown>;
}

/**
 * Structured JSON logger for NestJS, implementing the framework's
 * `LoggerService` contract so it can be swapped in via `app.useLogger()`
 * and receive internal framework log calls (bootstrap, exception filters).
 *
 * @remarks
 * Redacts known-sensitive keys before serialization. Debug output is
 * gated behind `observability.logging.level` config.
 */
@Injectable()
export class LoggerService extends Logger implements NestLoggerService {
  constructor(private readonly configService: ConfigService) {
    super('App');
  }

  /**
   * Recursively redacts sensitive keys from an object before logging.
   * Bounded to a depth of 5 to avoid pathological/circular structures.
   *
   * @param value - Arbitrary meta payload to sanitize.
   * @param depth - Current recursion depth (internal use).
   * @returns A deep copy of `value` with sensitive fields replaced.
   */
  private redact(value: unknown, depth = 0): unknown {
    if (depth > 5 || value === null || typeof value !== 'object') return value;
    if (Array.isArray(value))
      return value.map((v) => this.redact(v, depth + 1));

    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [
        k,
        SENSITIVE_KEYS.has(k.toLowerCase())
          ? '[REDACTED]'
          : this.redact(v, depth + 1),
      ]),
    );
  }

  /**
   * Serializes a log entry to JSON, falling back to a safe placeholder
   * if the payload contains circular references or other non-serializable data.
   */
  private serialize(entry: LogEntry): string {
    try {
      return JSON.stringify(entry);
    } catch {
      return JSON.stringify({ ...entry, meta: '[UNSERIALIZABLE]' });
    }
  }

  /**
   * It's a single factory function that takes the level plus the four possible pieces of a log call,
   * returns a fully-formed LogEntry object timestamped, context-resolved, and with meta redacted if present.
   * Every public method (log, error, warn, debug, verbose, fatal) now just calls build(...)
   * passes the result to serialize() then the appropriate console.
   */
  private build(
    level: LogEntry['level'],
    message: string,
    context?: string,
    meta?: Record<string, unknown>,
    trace?: string,
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: context || this.context,
      trace,
      meta: meta ? (this.redact(meta) as Record<string, unknown>) : undefined,
    };
  }

  /** Info-level log. Always emitted. */
  log(message: string, context?: string, meta?: Record<string, unknown>): void {
    console.log(
      this.serialize(this.build(LogLevelEnum.INFO, message, context, meta)),
    );
  }

  /** Error-level log with optional stack trace. Always emitted, written to stderr. */
  error(
    message: string,
    trace?: string,
    context?: string,
    meta?: Record<string, unknown>,
  ): void {
    console.error(
      this.serialize(
        this.build(LogLevelEnum.ERROR, message, context, meta, trace),
      ),
    );
  }

  /** Warning-level log. Always emitted. */
  warn(
    message: string,
    context?: string,
    meta?: Record<string, unknown>,
  ): void {
    console.warn(
      this.serialize(this.build(LogLevelEnum.WARN, message, context, meta)),
    );
  }

  /** Debug-level log. Gated behind `observability.logging.level === 'debug'`. */
  debug(
    message: string,
    context?: string,
    meta?: Record<string, unknown>,
  ): void {
    if (
      this.configService.get<string>('observability.logging.level') !== 'debug'
    )
      return;
    console.debug(
      this.serialize(this.build(LogLevelEnum.DEBUG, message, context, meta)),
    );
  }

  /** Verbose-level log. Nest's internals call this during bootstrap/lifecycle events. */
  verbose(
    message: string,
    context?: string,
    meta?: Record<string, unknown>,
  ): void {
    console.log(
      this.serialize(this.build(LogLevelEnum.VERBOSE, message, context, meta)),
    );
  }

  /** Fatal-level log, for unrecoverable errors before process exit. */
  fatal(
    message: string,
    trace?: string,
    context?: string,
    meta?: Record<string, unknown>,
  ): void {
    console.error(
      this.serialize(
        this.build(LogLevelEnum.FATAL, message, context, meta, trace),
      ),
    );
  }
}
