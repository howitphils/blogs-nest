import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { DomainException } from './exceptions/domain.exception';
import { DomainExceptionCode } from './exceptions/domain.exception-code';

@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: DomainException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    const status = this.switchDomainCodeToHttp(exception.code);

    res.status(status).json({ message: exception.message });
  }

  private switchDomainCodeToHttp(code: DomainExceptionCode) {
    switch (code) {
      case DomainExceptionCode.BAD_REQUEST:
      case DomainExceptionCode.VALIDATION_FAILED:
      case DomainExceptionCode.NOT_UNIQUE_ERROR:
        return HttpStatus.BAD_REQUEST;

      case DomainExceptionCode.FORBIDDEN:
        return HttpStatus.FORBIDDEN;

      case DomainExceptionCode.UNAUTHORIZED:
        return HttpStatus.UNAUTHORIZED;

      case DomainExceptionCode.NOT_FOUND:
        return HttpStatus.NOT_FOUND;

      default:
        return HttpStatus.I_AM_A_TEAPOT;
    }
  }
}
