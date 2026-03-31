import { HttpStatus } from '@nestjs/common';
import { HttpError } from '../../../../core/exceptions/http-exception';
import { ErrorResponse } from '../../../../core/types/error-response';

export class NotUniqueUserError extends HttpError {
  public errorResponse: ErrorResponse;

  constructor(field: string) {
    super('', HttpStatus.BAD_REQUEST);

    this.errorResponse = {
      errorsMessages: [{ field, message: `${field} should be unique` }],
    };
    this.name = 'NotUniqueUserError';
  }
}
