import { errorMessages } from '../../../../core/constants/error-messages.constants';
import { DomainException } from '../../../../core/exception-filters/exceptions/domain.exception';
import { DomainExceptionCode } from '../../../../core/exception-filters/exceptions/domain.exception-code';

export class UserNotFoundError extends DomainException {
  constructor() {
    super(errorMessages.USER_NOT_FOUND, DomainExceptionCode.NOT_FOUND);
    this.name = 'UserNotFoundError';
  }
}
