import { ErrorResponse } from '../../types/error-response.types';
import { DomainExceptionCode } from './domain.exception-code';

export class DomainException extends Error {
  code: DomainExceptionCode;
  errorResponse?: ErrorResponse;

  constructor(message: string, code: DomainExceptionCode) {
    super(message);
    this.code = code;
    this.name = 'DomainException';
  }
}
