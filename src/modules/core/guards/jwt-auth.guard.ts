import { TokenService } from './../services/token.service';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { DomainException } from '../exception-filters/exceptions/domain.exception';
import { errorMessages } from '../constants/error-messages.constants';
import { DomainExceptionCode } from '../exception-filters/exceptions/domain.exception-code';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private tokenService: TokenService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();

    const token = this.parseAuthHeader(req);

    const payload = await this.tokenService.verifyAccessToken(token);

    req['user'] = {
      userId: payload.userId,
    };

    return true;
  }

  private parseAuthHeader(req: Request): string {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      throw new DomainException(
        errorMessages.AUTH_HEADER_REQURIED,
        DomainExceptionCode.UNAUTHORIZED,
      );
    }

    const parts = authHeader.split(' ');

    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new DomainException(
        errorMessages.INCORRECT_AUTH_TYPE,
        DomainExceptionCode.UNAUTHORIZED,
      );
    }

    const token = parts[1];

    return token;
  }
}
