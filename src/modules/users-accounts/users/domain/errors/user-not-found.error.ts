import { DomainException } from '../../../../core/exception-filters/exceptions/domain.exception';
import { DomainExceptionCode } from '../../../../core/exception-filters/exceptions/domain.exception-code';

export class UserNotFoundError extends DomainException {
  constructor() {
    super('User was not found', DomainExceptionCode.NOT_FOUND);
    this.name = 'UserNotFoundError';
  }
}
