import { HttpStatus } from '@nestjs/common';
import { HttpError } from '../../../../core/exception-filters/exceptions/domain.exception';

export class UserNotFoundError extends HttpError {
  constructor() {
    super('User was not found', HttpStatus.NOT_FOUND);
    this.name = 'UserNotFoundError';
  }
}
