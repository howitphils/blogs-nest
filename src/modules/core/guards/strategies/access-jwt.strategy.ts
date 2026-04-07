import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayloadAccess } from '../../types/jwt-payload.types';
import { secretKeyAccess } from '../secret-key';

export class AccessJwtStrategy extends PassportStrategy(
  Strategy,
  'access-jwt', // For linking with AuthGuard
) {
  constructor() {
    super({
      ignoreExpiration: false,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: secretKeyAccess, // TODO: .env
    });
  }

  validate(payload: JwtPayloadAccess) {
    return {
      userId: payload.userId,
    };
  }
}
