import { DomainException } from '../../../../core/exception-filters/exceptions/domain.exception';
import { ErrorResponse } from '../../../../core/types/error-response.types';
import { DomainExceptionCode } from '../../../../core/exception-filters/exceptions/domain.exception-code';

export class NotUniqueUserException extends DomainException {
  errorResponse: ErrorResponse;

  constructor(field: string) {
    super('', DomainExceptionCode.BAD_REQUEST);

    this.errorResponse = {
      errorsMessages: [{ field, message: `${field} should be unique` }],
    };

    this.name = 'NotUniqueUserException';
  }
}
