import { AuthGuard } from '@nestjs/passport';
import { DomainException } from '../exception-filters/exceptions/domain.exception';
import { errorMessages } from '../constants/error-messages.constants';
import { DomainExceptionCode } from '../exception-filters/exceptions/domain.exception-code';

export class AccessTokenPassportGuard extends AuthGuard('access-jwt') {
  handleRequest<TUser = any>(err: any, user: TUser): TUser {
    if (!err || !user) {
      throw new DomainException(
        errorMessages.INVALID_TOKEN,
        DomainExceptionCode.UNAUTHORIZED,
      );
    }

    return user;
  }
}
