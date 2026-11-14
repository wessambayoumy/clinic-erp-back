import type { LogLevelEnum } from '@/shared/enums/observability';

/** Shape of every structured log line emitted by the logger service. */
export interface ILogEntry {
  timestamp: string;
  level: LogLevelEnum;
  message: string;
  context?: string;
  trace?: string;
  meta?: Record<string, unknown>;
}
