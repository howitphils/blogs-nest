import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DomainValidationException } from '../modules/core/exception-filters/exceptions/domain-validation.exception';
import { formatErrors } from '../modules/core/utils/format-errors';

export const setupPipes = (app: INestApplication) => {
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      stopAtFirstError: true,
      exceptionFactory: (errors) => {
        throw new DomainValidationException(formatErrors(errors));
      },
    }),
  );
};
