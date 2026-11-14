import { IsOptional, IsString } from 'class-validator';

/**
 * Body for POST /auth/refresh. Optional because the refresh token is typically
 * read from an httpOnly cookie; present it here only when the client sends it
 * explicitly (e.g. native/mobile clients).
 */
export class RefreshTokenDto {
  /** Refresh token sent explicitly by clients without cookie support. */
  @IsOptional()
  @IsString()
  refreshToken?: string;
}
