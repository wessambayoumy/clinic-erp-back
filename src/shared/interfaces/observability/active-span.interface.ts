/** Internal record for an in-flight tracing span. */
export interface IActiveSpan {
  name: string;
  /** Start time in milliseconds, from `performance.now()`. */
  startedAt: number;
  parentSpanId?: string;
}
