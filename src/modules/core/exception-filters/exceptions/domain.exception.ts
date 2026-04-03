import { DomainExceptionCode } from './domain.exception-code';

export class DomainException extends Error {
  public code: DomainExceptionCode;

  constructor(message: string, code: DomainExceptionCode) {
    super(message);
    this.code = code;
    this.name = 'DomainException';
  }
}
