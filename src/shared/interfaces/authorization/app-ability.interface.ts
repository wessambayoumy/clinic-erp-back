/**
 * Minimal authorization capability surface consumed by guards and factories.
 * Implemented by `AbilityFactory` per authenticated user.
 */
export interface IAppAbility {
  /** Returns `true` when the subject may perform the action. */
  can(action: string, subject: string): boolean;
  /** Returns `true` when the subject may not perform the action. */
  cannot(action: string, subject: string): boolean;
}
