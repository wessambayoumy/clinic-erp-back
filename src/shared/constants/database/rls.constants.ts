/**
 * Postgres GUC keys set by `RLSService.applyContext()` and read by
 * `rls-policies.sql` (`app_current_org_id()`). Single source of truth:
 * change a key here and in the SQL file together.
 */
export const RLS_CONTEXT_VARS = {
  CURRENT_USER_ID: 'app.user_id',
  CURRENT_ORG_ID: 'app.organization_id',
  CURRENT_LOCATION_ID: 'app.location_id',
} as const;
