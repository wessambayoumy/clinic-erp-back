import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('auth.jwt.accessSecret'),
      issuer: configService.get<string>('auth.jwt.issuer'),
      audience: configService.get<string>('auth.jwt.audience'),
    });
  }

  validate(payload: Record<string, unknown>): AuthenticatedUser {
    return {
      id: String(payload.sub),
      email: String(payload.email),
      organizationId: String(payload.organizationId),
      locationId: String(payload.locationId),
      roles: Array.isArray(payload.roles)
        ? payload.roles.filter((role): role is string => typeof role === 'string')
        : [],
    };
  }
}
