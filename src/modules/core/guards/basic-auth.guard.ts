import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { DomainException } from '../exception-filters/exceptions/domain.exception';
import { errorMessages } from '../constants/error-messages.constants';
import { DomainExceptionCode } from '../exception-filters/exceptions/domain.exception-code';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class BasicAuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();

    const authHeader = req.headers['authorization'];

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    if (!authHeader || !authHeader.startsWith('Basic ')) {
      throw new DomainException(
        errorMessages.AUTH_HEADER_REQURIED,
        DomainExceptionCode.UNAUTHORIZED,
      );
    }

    const [username, password] = this.parseAuthHeader(authHeader);

    //TODO: .env
    const validUserName = 'admin';
    const validPassword = 'qwerty';

    if (username !== validUserName || password !== validPassword) {
      throw new DomainException(
        errorMessages.INVALID_CREDENTIALS,
        DomainExceptionCode.UNAUTHORIZED,
      );
    }

    return true;
  }

  private parseAuthHeader(header: string): string[] {
    const encodedCredentials = header.split(' ')[1];

    const stringCredentials = Buffer.from(
      encodedCredentials,
      'base64',
    ).toString('ascii');

    return stringCredentials.split(':');
  }
}
