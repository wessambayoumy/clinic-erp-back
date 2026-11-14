/** Result returned by a readiness/liveness health indicator. */
export interface IHealthStatus {
  status: string;
  error?: string;
}
