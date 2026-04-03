import { HttpStatus } from '@nestjs/common';
import { HttpError } from '../../../../core/exception-filters/exceptions/domain.exception';

export class CommentNotFoundError extends HttpError {
  constructor() {
    super('Comment was not found', HttpStatus.NOT_FOUND);
    this.name = 'CommentNotFoundError';
  }
}

export class CommentLikeNotFoundError extends HttpError {
  constructor() {
    super("Comment's like was not found", HttpStatus.NOT_FOUND);
    this.name = 'CommentLikeNotFoundError';
  }
}
