import type { db } from '@/core/database/db';

/**
 * The transaction handle Prisma ORM 8 passes into `db.transaction(callback)`.
 * Prisma exports no name for this type, so it is derived from the client's own
 * `transaction` method signature — the derivation the Prisma docs themselves
 * recommend for this exact situation.
 */
export type PrismaTransaction = Parameters<
  Parameters<typeof db.transaction>[0]
>[0];
