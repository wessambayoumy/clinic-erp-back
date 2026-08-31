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
      secretOrKey: configService.get<string>('auth.jwt.accessSecret'),
    });
  }

  async validate(payload: any): Promise<AuthenticatedUser> {
    return {
      id: payload.sub,
      email: payload.email,
      organizationId: payload.organizationId,
      locationId: payload.locationId,
      roles: payload.roles || [],
    };
  }
}
