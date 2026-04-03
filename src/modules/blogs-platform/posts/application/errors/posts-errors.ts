import { HttpStatus } from '@nestjs/common';
import { HttpError } from '../../../../core/exception-filters/exceptions/domain.exception';

export class PostNotFoundError extends HttpError {
  constructor() {
    super('Post was not found', HttpStatus.NOT_FOUND);
    this.name = 'PostNotFoundError';
  }
}
