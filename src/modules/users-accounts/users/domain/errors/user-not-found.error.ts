import { HttpStatus } from '@nestjs/common';
import { HttpError } from '../../../../core/exceptions/http-exception';

export class UserNotFoundError extends HttpError {
  constructor() {
    super('User was not found', HttpStatus.NOT_FOUND);
    this.name = 'UserNotFoundError';
  }
}
