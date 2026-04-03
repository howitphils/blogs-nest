import { ErrorMessages } from '../../constants/error-messages.constants';
import { ErrorResponse, FieldError } from '../../types/error-response.types';
import { DomainException } from './domain.exception';
import { DomainExceptionCode } from './domain.exception-code';

export class DomainValidationException extends DomainException {
  errorResponse: ErrorResponse;

  constructor(errors: FieldError[]) {
    super(
      ErrorMessages.VALIDATION_FAILED,
      DomainExceptionCode.VALIDATION_FAILED,
    );

    this.errorResponse = { errorsMessages: errors };
    this.name = 'DomainValidationException';
  }
}
