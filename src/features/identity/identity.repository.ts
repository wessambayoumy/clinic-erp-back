import { Injectable } from '@nestjs/common';
import type { PrismaTransaction } from '@/shared/types';
import { Observed } from '@/common/decorators';

/** Tenant-aware repository for the User model owned by this feature. */
@Observed()
@Injectable()
export class IdentityRepository {
  /** Finds an organization account by normalized email within the supplied transaction. */
  public findAccount(
    tx: PrismaTransaction,
    organizationId: string,
    email: string,
  ): Promise<unknown> {
    return tx.orm.public.User.first({ organizationId, email });
  }

  /** Creates an unverified account within the caller's tenant-scoped transaction. */
  public createAccount(
    tx: PrismaTransaction,
    input: {
      organizationId: string;
      email: string;
      password: string;
      firstName: string;
      lastName: string;
    },
  ): Promise<unknown> {
    return tx.orm.public.User.create({ ...input, emailVerified: false });
  }

  /** Marks the account email verified within the caller's transaction. */
  public updateEmailVerified(
    tx: PrismaTransaction,
    id: string,
    organizationId: string,
  ): Promise<unknown> {
    return tx.orm.public.User.where({ id, organizationId }).update({
      emailVerified: true,
    });
  }

  /** Updates an account password within the caller's transaction. */
  public updatePassword(
    tx: PrismaTransaction,
    id: string,
    organizationId: string,
    password: string,
  ): Promise<unknown> {
    return tx.orm.public.User.where({ id, organizationId }).update({ password });
  }

  /** Finds a clinic location by ID within its owning organization. */
  public findLocation(
    tx: PrismaTransaction,
    organizationId: string,
    locationId: string,
  ): Promise<unknown> {
    return tx.orm.public.Location.first({ id: locationId, organizationId });
  }
}
