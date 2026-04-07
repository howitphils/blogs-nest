import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { ThrottlerException } from '@nestjs/throttler';
import { Response } from 'express';
import { errorMessages } from '../constants/error-messages.constants';

@Catch(ThrottlerException)
export class ThrottlerExceptionFilter implements ExceptionFilter {
  catch(exception: ThrottlerException, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();

    return res
      .status(HttpStatus.TOO_MANY_REQUESTS)
      .json({ message: errorMessages.TOO_MANY_REQUESTS });
  }
}
