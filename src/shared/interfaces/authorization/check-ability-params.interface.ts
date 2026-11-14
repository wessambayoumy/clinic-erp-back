/**
 * Declares a single authorization requirement checked by `AbilityGuard`.
 */
export interface ICheckAbilityParams {
  /** Action the caller must be permitted to perform (e.g. `manage:patients`). */
  action: string;
  /** Subject the action applies to (e.g. `patients`). */
  subject: string;
}
