import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';
import { Request } from 'express';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('auth.jwt.refreshSecret'),
      issuer: configService.get<string>('auth.jwt.issuer'),
      audience: configService.get<string>('auth.jwt.audience'),
      passReqToCallback: true,
    });
  }

  validate(
    _request: Request,
    payload: Record<string, unknown>,
  ): Promise<AuthenticatedUser> {
    return Promise.resolve({
      id: String(payload.sub),
      email: String(payload.email),
      organizationId: String(payload.organizationId),
      locationId: String(payload.locationId),
      roles: Array.isArray(payload.roles)
        ? payload.roles.filter((role): role is string => typeof role === 'string')
        : [],
    });
  }
}
